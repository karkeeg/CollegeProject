import prisma from '../config/database';
import { FileProcessor } from '../utils/file-processor.util';
import path from 'path';

export interface Question {
    text: string;
    type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER';
    options?: string[];
    correctAnswer: string;
}

// --- TF-IDF & NLP Helpers ---

const STOP_WORDS = new Set([
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at", 
    "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot", "could", 
    "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for", 
    "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", 
    "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", 
    "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", 
    "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", 
    "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", 
    "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", 
    "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", 
    "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", 
    "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", 
    "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", 
    "yourselves", "topic", "assignment", "page", "chapter", "section", "following", "created", "generated"
]);

class TextAnalyzer {
    static sanitize(text: string): string {
        return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim();
    }

    /**
     * More robust sentence splitting.
     * Avoids splitting on common abbreviations like e.g., i.e., vs.
     */
    static getSentences(text: string): string[] {
        // Lookbehind for (not e.g. or i.e.) followed by [.!?] and space/end
        // Since JS regex lookbehind is now widely supported in Node.js
        return text.split(/(?<=[.!?])\s+(?=[A-Z])/g) || [text];
    }

    static getWords(text: string): string[] {
        return text.split(/\s+/).map(w => w.toLowerCase().replace(/[^a-z0-9]/g, "")).filter(w => w.length > 2);
    }

    /**
     * Calculates Term Frequency (TF) for unigrams.
     */
    static computeTermFrequency(text: string): Map<string, number> {
        const words = this.getWords(text);
        const tf = new Map<string, number>();
        words.forEach(w => {
            if (!STOP_WORDS.has(w)) {
                tf.set(w, (tf.get(w) || 0) + 1);
            }
        });
        return tf;
    }

    /**
     * Identifies Bi-Grams (2-word phrases) that appear together.
     * e.g., "Machine Learning", "Data Structure"
     */
    static computeBiGrams(text: string): Map<string, number> {
        const words = text.split(/\s+/).map(w => w.toLowerCase().replace(/[^a-z0-9]/g, ""));
        const biGrams = new Map<string, number>();
        
        for (let i = 0; i < words.length - 1; i++) {
            const w1 = words[i];
            const w2 = words[i+1];
            
            if (w1.length > 2 && w2.length > 2 && !STOP_WORDS.has(w1) && !STOP_WORDS.has(w2)) {
                const biGram = `${w1} ${w2}`;
                biGrams.set(biGram, (biGrams.get(biGram) || 0) + 1);
            }
        }
        return biGrams;
    }

    /**
     * Identifies "Key Concepts" using both Unigrams and Bi-Grams.
     */
    static extractKeyConcepts(fullText: string): Map<string, number> {
        const uniTf = this.computeTermFrequency(fullText);
        const biTf = this.computeBiGrams(fullText);
        
        const combined = new Map<string, number>();
        
        // Add unigrams with original weighting
        uniTf.forEach((count, word) => combined.set(word, count));
        
        // Add bigrams with a boost (2x) as they are often more specific concepts
        biTf.forEach((count, phrase) => {
            if (count > 1) { // Only keep frequent bigrams
                combined.set(phrase, count * 2);
            }
        });

        // Normalize scores
        const maxFreq = Math.max(...Array.from(combined.values()), 1);
        combined.forEach((count, concept) => combined.set(concept, count / maxFreq));
        
        return combined;
    }
}

export class QuizGeneratorAlgorithm {

    // --- Main Entry Point ---

    static async generateQuizDraft(subjectId: number, teacherId: string): Promise<Question[]> {
        const contextText = await this.aggregateSubjectContext(subjectId);
        
        if (!contextText || contextText.length < 200) {
            return this.generateFallbackQuestions();
        }

        return this.generateQuestionsFromContext(contextText);
    }

    // --- Data Aggregation ---

    private static async aggregateSubjectContext(subjectId: number): Promise<string> {
        let fullText = "";

        // 1. Fetch Assignments
        const assignments = await prisma.assignment.findMany({
            where: { subjectId },
        });

        for (const assignment of assignments) {
            fullText += `${assignment.title}. `;
            if (assignment.description) fullText += `${assignment.description} `;

            if (assignment.attachmentUrl) {
                try {
                    const relativePath = assignment.attachmentUrl.startsWith('/') ? assignment.attachmentUrl.slice(1) : assignment.attachmentUrl;
                    const absolutePath = path.resolve(process.cwd(), relativePath);
                    console.log(`[QuizGen] Processing assignment file: ${absolutePath}`);
                    const fileText = await FileProcessor.extractText(absolutePath);
                    fullText += `${fileText} `;
                } catch (e) {
                    console.error(`Failed to read attachment for assignment ${assignment.id}:`, e);
                }
            }
            fullText += "\n";
        }

        // 2. Fetch Class Materials
        const materials = await prisma.classMaterial.findMany({
            where: { subjectId }
        });

        for (const material of materials) {
            fullText += `${material.title}. `;
            if (material.description) fullText += `${material.description} `;

            if (material.fileUrl) {
                try {
                    const relativePath = material.fileUrl.startsWith('/') ? material.fileUrl.slice(1) : material.fileUrl;
                    const absolutePath = path.resolve(process.cwd(), relativePath);
                    console.log(`[QuizGen] Processing class material file: ${absolutePath}`);
                    const fileText = await FileProcessor.extractText(absolutePath);
                    fullText += `${fileText} `;
                } catch (e) {
                    console.error(`Failed to read class material file ${material.id}:`, e);
                }
            }
            fullText += "\n";
        }

        return fullText;
    }

    // --- Core Algorithm ---

    private static generateQuestionsFromContext(text: string): Question[] {
        const questions: Question[] = [];
        const sentences = TextAnalyzer.getSentences(text);
        
        // 1. Keyword Analysis (including Bi-Grams)
        const keywordScores = TextAnalyzer.extractKeyConcepts(text);
        const topConcepts = Array.from(keywordScores.entries())
            .sort((a, b) => b[1] - a[1]) // Sort by score descending
            .slice(0, 40)                // Top 40 concepts
            .map(e => e[0]);

        // 2. Sentence Scoring & Filtering
        const scoredSentences = sentences.map(sentence => {
            const cleanSentence = sentence.trim();
            const words = TextAnalyzer.getWords(cleanSentence);
            const lowerSentence = cleanSentence.toLowerCase();
            
            // Basic Filters
            if (words.length < 6 || words.length > 40) return { s: cleanSentence, score: 0 };
            if (/^(however|therefore|also|but|and|so|typically|usually)/i.test(cleanSentence)) return { s: cleanSentence, score: 0 };
            if (cleanSentence.includes("?")) return { s: cleanSentence, score: 0 };
            
            // Scoring: Concept Density
            let score = 0;
            keywordScores.forEach((val, concept) => {
                if (lowerSentence.includes(concept)) {
                    score += val;
                }
            });

            // Definition Heuristic Boost
            const definitionMarkers = ["is known as", "refers to", "refers", "means", "is a type of", "is defined as", "called"];
            if (definitionMarkers.some(marker => lowerSentence.includes(marker))) {
                score *= 1.5;
            }

            return { s: cleanSentence, score: score / words.length }; 
        }).filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score);

        // 3. Question Generation Loop
        const usedConcepts = new Set<string>();
        const targetQuestionsCount = 10;

        for (const { s: sentence } of scoredSentences) {
            if (questions.length >= targetQuestionsCount) break;

            const newQuestion = this.createQuestionFromSentence(sentence, keywordScores, topConcepts, usedConcepts);
            if (newQuestion) {
                questions.push(newQuestion);
            }
        }

        // Fallback
        if (questions.length < 5) {
            questions.push(...this.generateFallbackQuestions().slice(0, 5 - questions.length));
        }

        return questions;
    }

    private static createQuestionFromSentence(
        sentence: string, 
        keywordScores: Map<string, number>, 
        allTopConcepts: string[],
        usedConcepts: Set<string>
    ): Question | null {
        const lowerSentence = sentence.toLowerCase();
        
        // 1. Identify candidates (Bi-Grams first, then Uni-Grams)
        const candidates = allTopConcepts
            .filter(concept => lowerSentence.includes(concept) && !usedConcepts.has(concept))
            .sort((a, b) => {
                // Prioritize longer concepts (Bi-Grams) and higher scores
                if (a.includes(' ') && !b.includes(' ')) return -1;
                if (!a.includes(' ') && b.includes(' ')) return 1;
                return (keywordScores.get(b) || 0) - (keywordScores.get(a) || 0);
            });

        if (candidates.length === 0) return null;
        
        const bestConcept = candidates[0];
        usedConcepts.add(bestConcept);

        // --- Question Type Decision ---
        // MCQ 60%, T/F 30%, Short Answer 10%
        const rand = Math.random();
        
        if (rand < 0.6) {
            // MCQ
            const distractors = allTopConcepts
                .filter(c => c !== bestConcept && !bestConcept.includes(c) && !c.includes(bestConcept))
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);

            if (distractors.length < 3) return null;

            // Find original casing in sentence for replacement
            const regex = new RegExp(bestConcept, 'gi');
            const match = sentence.match(regex);
            const displayAnswer = match ? match[0] : bestConcept;

            return {
                text: sentence.replace(regex, "_______"),
                type: 'MCQ',
                options: [...distractors, displayAnswer].sort(() => 0.5 - Math.random()),
                correctAnswer: displayAnswer
            };
        } else if (rand < 0.9) {
            // True / False
            const isTruth = Math.random() > 0.5;
            if (isTruth) {
                return {
                    text: `True or False: ${sentence}`,
                    type: 'TRUE_FALSE',
                    options: ['True', 'False'],
                    correctAnswer: 'True'
                };
            } else {
                // Create a False statement by swapping bestConcept with a random distractor
                const distractor = allTopConcepts
                    .filter(c => c !== bestConcept && !bestConcept.includes(c) && !c.includes(bestConcept))
                    .sort(() => 0.5 - Math.random())[0];
                
                if (!distractor) return null;

                const regex = new RegExp(bestConcept, 'gi');
                const falseSentence = sentence.replace(regex, distractor);

                return {
                    text: `True or False: ${falseSentence}`,
                    type: 'TRUE_FALSE',
                    options: ['True', 'False'],
                    correctAnswer: 'False'
                };
            }
        } else {
            // Short Answer
            const regex = new RegExp(bestConcept, 'gi');
            return {
                text: sentence.replace(regex, "_______"),
                type: 'SHORT_ANSWER',
                correctAnswer: bestConcept
            };
        }
    }

    private static generateFallbackQuestions(): Question[] {
        return [
            {
                text: "What is the primary goal of this subject?",
                type: "SHORT_ANSWER",
                correctAnswer: "To understand the core concepts."
            },
            {
                text: "The content provided was insufficient to generate specific questions. True or False?",
                type: "TRUE_FALSE",
                options: ["True", "False"],
                correctAnswer: "True"
            }
        ];
    }
}
