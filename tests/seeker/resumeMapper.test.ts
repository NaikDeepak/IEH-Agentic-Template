import { describe, it, expect, vi } from 'vitest';
import { ResumeMapper } from '../../src/features/seeker/services/resumeMapper';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
    serverTimestamp: vi.fn(() => 'mock-timestamp')
}));

describe('ResumeMapper', () => {
    const userId = 'user123';
    const rawText = 'This is a resume text';
    const filename = 'resume.pdf';

    it('should map standard AI response to domain model', () => {
        const aiResponse = {
            score: 0.85,
            sections: {
                contact: true,
                summary: true,
                experience: true,
                education: true,
                skills: true
            },
            keywords: {
                found: ['React', 'Node.js'],
                missing: ['AWS']
            },
            suggestions: ['Add more keywords'],
            parsed_data: {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '1234567890',
                links: ['linkedin.com/in/johndoe'],
                experience: [
                    {
                        company: 'Tech Corp',
                        role: 'Developer',
                        duration: '2 years',
                        description: 'Coding'
                    }
                ],
                education: [
                    {
                        institution: 'University X',
                        degree: 'BSCS',
                        year: '2020'
                    }
                ],
                skills: ['JavaScript', 'HTML']
            }
        };

        const result = ResumeMapper.mapToDomain(userId, rawText, filename, aiResponse);

        expect(result.score).toBe(85);
        expect(result.parsed_data.name).toBe('John Doe');
        expect(result.parsed_data.experience?.[0]?.company).toBe('Tech Corp');
        expect(result.analyzed_at).toBe('mock-timestamp');
    });

    it('should handle score normalization (0.85 -> 85)', () => {
        const baseResponse = {
            sections: {},
            keywords: {},
            suggestions: []
        };

        expect(ResumeMapper.mapToDomain(userId, rawText, filename, { ...baseResponse, score: 0.85 }).score).toBe(85);
        expect(ResumeMapper.mapToDomain(userId, rawText, filename, { ...baseResponse, score: '0.9' }).score).toBe(90);
        expect(ResumeMapper.mapToDomain(userId, rawText, filename, { ...baseResponse, score: 75 }).score).toBe(75);
    });

    it('should handle missing parsed_data and use top-level fields', () => {
        const aiResponse = {
            score: 70,
            sections: { contact: false, summary: false, experience: false, education: false, skills: false },
            keywords: { found: [], missing: [] },
            suggestions: [],
            name: 'Jane Doe',
            email: 'jane@example.com',
            experience: [{ organization: 'Old Co', title: 'Analyst', dates: '2019' }]
        };

        const result = ResumeMapper.mapToDomain(userId, rawText, filename, aiResponse);

        expect(result.parsed_data.name).toBe('Jane Doe');
        expect(result.parsed_data.email).toBe('jane@example.com');
        expect(result.parsed_data.experience?.[0]?.company).toBe('Old Co');
    });

    it('should handle complex experience descriptions (arrays and fallbacks)', () => {
        const aiResponse = {
            score: 60,
            sections: {},
            keywords: {},
            suggestions: [],
            parsed_data: {
                experience: [
                    {
                        company: 'Desc Array',
                        description: ['Line 1', 'Line 2']
                    },
                    {
                        company: 'Resp Array',
                        responsibilities: ['Resp 1']
                    },
                    {
                        company: 'Single String',
                        description: 'One line'
                    }
                ]
            }
        };

        const result = ResumeMapper.mapToDomain(userId, rawText, filename, aiResponse);

        expect(result.parsed_data.experience?.[0]?.description).toEqual(['Line 1', 'Line 2']);
        expect(result.parsed_data.experience?.[1]?.description).toEqual(['Resp 1']);
        expect(result.parsed_data.experience?.[2]?.description).toEqual(['One line']);
    });

    it('should provide default values for missing data', () => {
        const aiResponse = {
            score: 0,
            sections: {},
            keywords: {},
            suggestions: {} // Invalid but should handle
        };

        const result = ResumeMapper.mapToDomain(userId, rawText, filename, aiResponse);

        expect(result.score).toBe(0);
        expect(result.parsed_data.name).toBe("");
        expect(result.parsed_data.experience).toEqual([]);
        expect(result.suggestions).toEqual([]);
    });
});
