import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompanyService } from '../companyService';

vi.mock('firebase/firestore', () => ({
    doc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
}));

vi.mock('../../../../lib/firebase', () => ({
    db: {},
}));

import { doc, getDoc, getDocs, collection, query, where, addDoc, updateDoc } from 'firebase/firestore';

const mockCompany = {
    id: 'comp-1',
    name: 'Acme Corp',
    bio: 'We build things',
    website: 'https://acme.com',
    location: 'Mumbai',
    employer_ids: ['emp-1'],
};

describe('CompanyService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (doc as any).mockReturnValue('mock-doc-ref');
        (collection as any).mockReturnValue('mock-collection');
        (query as any).mockReturnValue('mock-query');
        (where as any).mockReturnValue('mock-where');
    });

    describe('getCompanyById', () => {
        it('returns company when document exists', async () => {
            (getDoc as any).mockResolvedValue({
                exists: () => true,
                id: 'comp-1',
                data: () => ({ name: 'Acme Corp', bio: 'We build things', website: 'https://acme.com', location: 'Mumbai', employer_ids: ['emp-1'] }),
            });

            const result = await CompanyService.getCompanyById('comp-1');
            expect(result).toEqual({ id: 'comp-1', ...mockCompany, id: 'comp-1' });
            expect(doc).toHaveBeenCalledWith({}, 'companies', 'comp-1');
        });

        it('returns null when document does not exist', async () => {
            (getDoc as any).mockResolvedValue({ exists: () => false });
            const result = await CompanyService.getCompanyById('nonexistent');
            expect(result).toBeNull();
        });
    });

    describe('getCompanyByEmployerId', () => {
        it('returns company when found', async () => {
            (getDocs as any).mockResolvedValue({
                docs: [{
                    id: 'comp-1',
                    data: () => ({ name: 'Acme Corp', bio: 'We build things', website: 'https://acme.com', location: 'Mumbai', employer_ids: ['emp-1'] }),
                }],
            });

            const result = await CompanyService.getCompanyByEmployerId('emp-1');
            expect(result).toEqual(expect.objectContaining({ id: 'comp-1', name: 'Acme Corp' }));
            expect(where).toHaveBeenCalledWith('employer_ids', 'array-contains', 'emp-1');
        });

        it('returns null when no company found', async () => {
            (getDocs as any).mockResolvedValue({ docs: [] });
            const result = await CompanyService.getCompanyByEmployerId('emp-999');
            expect(result).toBeNull();
        });
    });

    describe('createCompany', () => {
        it('creates company and returns the new document id', async () => {
            (addDoc as any).mockResolvedValue({ id: 'new-comp-id' });

            const { id: _id, ...companyData } = mockCompany;
            const result = await CompanyService.createCompany(companyData);

            expect(result).toBe('new-comp-id');
            expect(addDoc).toHaveBeenCalledWith('mock-collection', expect.objectContaining({
                name: 'Acme Corp',
                created_at: 'SERVER_TIMESTAMP',
                updated_at: 'SERVER_TIMESTAMP',
            }));
        });
    });

    describe('updateCompany', () => {
        it('calls updateDoc with updates and updated_at timestamp', async () => {
            (updateDoc as any).mockResolvedValue(undefined);

            await CompanyService.updateCompany('comp-1', { name: 'New Name' });

            expect(doc).toHaveBeenCalledWith({}, 'companies', 'comp-1');
            expect(updateDoc).toHaveBeenCalledWith('mock-doc-ref', expect.objectContaining({
                name: 'New Name',
                updated_at: 'SERVER_TIMESTAMP',
            }));
        });
    });
});
