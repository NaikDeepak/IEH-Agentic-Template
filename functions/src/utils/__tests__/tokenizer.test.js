import { describe, it, expect } from 'vitest';
import {
    normalize,
    tokenizeKeywords,
    tokenizeLocation,
    tokenizeJobType,
    generateAlertTokens,
    generateJobTokens,
} from '../tokenizer.js';

describe('tokenizer', () => {
    describe('normalize', () => {
        it('lowercases and trims strings', () => {
            expect(normalize('  HELLO World  ')).toBe('hello world');
        });
        
        it('handles null/undefined', () => {
            expect(normalize(null)).toBe('');
            expect(normalize(undefined)).toBe('');
        });
    });
    
    describe('tokenizeKeywords', () => {
        it('splits on commas and spaces', () => {
            expect(tokenizeKeywords('React, JavaScript Node.js')).toEqual(['react', 'javascript', 'node.js']);
        });
        
        it('filters out single character tokens', () => {
            expect(tokenizeKeywords('a React b JavaScript')).toEqual(['react', 'javascript']);
        });
        
        it('limits to 20 tokens', () => {
            const manyKeywords = Array(30).fill('word').join(' ');
            expect(tokenizeKeywords(manyKeywords).length).toBe(20);
        });
        
        it('handles empty input', () => {
            expect(tokenizeKeywords('')).toEqual([]);
            expect(tokenizeKeywords(null)).toEqual([]);
        });
    });
    
    describe('tokenizeLocation', () => {
        it('prefixes with loc: and normalizes spaces', () => {
            expect(tokenizeLocation('San Francisco')).toBe('loc:san-francisco');
        });

        it('collapses consecutive spaces to a single dash', () => {
            expect(tokenizeLocation('New   York')).toBe('loc:new-york');
        });
        
        it('returns null for short locations', () => {
            expect(tokenizeLocation('A')).toBeNull();
            expect(tokenizeLocation('')).toBeNull();
        });
    });
    
    describe('tokenizeJobType', () => {
        it('prefixes with type: and lowercases', () => {
            expect(tokenizeJobType('FULL_TIME')).toBe('type:full_time');
        });
        
        it('returns null for empty', () => {
            expect(tokenizeJobType('')).toBeNull();
        });
    });
    
    describe('generateAlertTokens', () => {
        it('combines keyword, location, and job type tokens', () => {
            const alert = {
                keywords: 'React, JavaScript',
                location: 'New York',
                jobType: 'FULL_TIME',
            };
            const tokens = generateAlertTokens(alert);
            
            expect(tokens).toContain('react');
            expect(tokens).toContain('javascript');
            expect(tokens).toContain('loc:new-york');
            expect(tokens).toContain('type:full_time');
        });
        
        it('deduplicates tokens', () => {
            const alert = {
                keywords: 'React react REACT',
                location: '',
                jobType: '',
            };
            const tokens = generateAlertTokens(alert);
            const reactCount = tokens.filter(t => t === 'react').length;
            expect(reactCount).toBe(1);
        });
        
        it('handles empty alert', () => {
            expect(generateAlertTokens({})).toEqual([]);
        });
    });
    
    describe('generateJobTokens', () => {
        it('generates tokens from job fields', () => {
            const job = {
                title: 'Senior React Developer',
                skills: ['JavaScript', 'React', 'Node.js'],
                location: 'Remote',
                type: 'CONTRACT',
            };
            const tokens = generateJobTokens(job);
            
            expect(tokens).toContain('senior');
            expect(tokens).toContain('react');
            expect(tokens).toContain('developer');
            expect(tokens).toContain('javascript');
            expect(tokens).toContain('node.js');
            expect(tokens).toContain('loc:remote');
            expect(tokens).toContain('type:contract');
        });
        
        it('limits to 30 tokens for Firestore constraint', () => {
            const job = {
                title: Array(20).fill('word').join(' '),
                skills: Array(20).fill('skill'),
                location: 'Location',
                type: 'FULL_TIME',
            };
            expect(generateJobTokens(job).length).toBeLessThanOrEqual(30);
        });
        
        it('handles missing fields gracefully', () => {
            expect(generateJobTokens({})).toEqual([]);
            expect(generateJobTokens({ title: 'Developer' })).toEqual(['developer']);
        });
    });
});
