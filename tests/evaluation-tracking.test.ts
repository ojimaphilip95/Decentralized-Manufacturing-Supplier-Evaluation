import { describe, it, expect, beforeEach } from 'vitest';

// Mock for testing purposes
class EvaluationTrackingMock {
  private admin: string;
  private evaluations: Map<string, {
    evaluator: string,
    score: number,
    timestamp: number,
    comments: string
  }>;
  private evaluationCounts: Map<string, { count: number }>;
  
  constructor() {
    this.admin = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    this.evaluations = new Map();
    this.evaluationCounts = new Map();
  }
  
  getAdmin() {
    return this.admin;
  }
  
  setAdmin(newAdmin: string, caller: string) {
    if (caller !== this.admin) {
      return { error: 1 };
    }
    this.admin = newAdmin;
    return { value: true };
  }
  
  // Helper to generate evaluation key
  private getEvaluationKey(supplier: string, period: number, criteriaId: number): string {
    return `${supplier}-${period}-${criteriaId}`;
  }
  
  // Helper to generate count key
  private getCountKey(supplier: string, period: number): string {
    return `${supplier}-${period}`;
  }
  
  addEvaluation(supplier: string, period: number, criteriaId: number,
                score: number, comments: string, caller: string) {
    // In a real implementation, we'd check if caller is authorized
    if (caller !== this.admin) {
      return { error: 1 };
    }
    
    if (score > 100) {
      return { error: 2 };
    }
    
    const key = this.getEvaluationKey(supplier, period, criteriaId);
    const countKey = this.getCountKey(supplier, period);
    
    // Increment count
    const currentCount = this.evaluationCounts.get(countKey)?.count || 0;
    this.evaluationCounts.set(countKey, { count: currentCount + 1 });
    
    // Set evaluation
    this.evaluations.set(key, {
      evaluator: caller,
      score,
      timestamp: 200, // Mock block height
      comments
    });
    
    return { value: true };
  }
  
  getEvaluation(supplier: string, period: number, criteriaId: number) {
    const key = this.getEvaluationKey(supplier, period, criteriaId);
    return this.evaluations.get(key);
  }
  
  getEvaluationCount(supplier: string, period: number) {
    const key = this.getCountKey(supplier, period);
    return this.evaluationCounts.get(key)?.count || 0;
  }
  
  updateEvaluation(supplier: string, period: number, criteriaId: number,
                   score: number, comments: string, caller: string) {
    if (caller !== this.admin) {
      return { error: 1 };
    }
    
    if (score > 100) {
      return { error: 2 };
    }
    
    const key = this.getEvaluationKey(supplier, period, criteriaId);
    if (!this.evaluations.has(key)) {
      return { error: 3 };
    }
    
    this.evaluations.set(key, {
      evaluator: caller,
      score,
      timestamp: 300, // Mock new block height
      comments
    });
    
    return { value: true };
  }
}

describe('Evaluation Tracking Contract', () => {
  let contract: EvaluationTrackingMock;
  const admin = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const nonAdmin = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  const supplier1 = 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC';
  const period = 202401; // January 2024
  const qualityCriteriaId = 1;
  const deliveryCriteriaId = 2;
  
  beforeEach(() => {
    contract = new EvaluationTrackingMock();
  });
  
  it('should allow admin to add evaluations', () => {
    const result = contract.addEvaluation(
        supplier1,
        period,
        qualityCriteriaId,
        85,
        'Good quality materials',
        admin
    );
    
    expect(result).toEqual({ value: true });
    
    const evaluation = contract.getEvaluation(supplier1, period, qualityCriteriaId);
    expect(evaluation).toBeDefined();
    expect(evaluation?.score).toBe(85);
    expect(evaluation?.comments).toBe('Good quality materials');
  });
  
  it('should not allow non-admin to add evaluations', () => {
    const result = contract.addEvaluation(
        supplier1,
        period,
        qualityCriteriaId,
        85,
        'Good quality materials',
        nonAdmin
    );
    
    expect(result).toEqual({ error: 1 });
  });
  
  it('should track evaluation counts correctly', () => {
    // Add two evaluations for the same supplier and period
    contract.addEvaluation(supplier1, period, qualityCriteriaId, 85, 'Quality comment', admin);
    contract.addEvaluation(supplier1, period, deliveryCriteriaId, 90, 'Delivery comment', admin);
    
    expect(contract.getEvaluationCount(supplier1, period)).toBe(2);
  });
  
  it('should allow admin to update existing evaluations', () => {
    // First add an evaluation
    contract.addEvaluation(supplier1, period, qualityCriteriaId, 85, 'Initial comment', admin);
    
    // Then update it
    const result = contract.updateEvaluation(
        supplier1,
        period,
        qualityCriteriaId,
        90,
        'Updated comment',
        admin
    );
    
    expect(result).toEqual({ value: true });
    
    const evaluation = contract.getEvaluation(supplier1, period, qualityCriteriaId);
    expect(evaluation?.score).toBe(90);
    expect(evaluation?.comments).toBe('Updated comment');
  });
  
  it('should not allow updating non-existent evaluations', () => {
    const result = contract.updateEvaluation(
        supplier1,
        period,
        999, // Non-existent criteria ID
        90,
        'Comment',
        admin
    );
    
    expect(result).toEqual({ error: 3 });
  });
});
