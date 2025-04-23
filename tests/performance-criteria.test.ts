import { describe, it, expect, beforeEach } from 'vitest';

// Mock for testing purposes
class PerformanceCriteriaMock {
  private admin: string;
  private criteria: Map<number, {
    name: string,
    description: string,
    weight: number,
    active: boolean
  }>;
  
  // Constants
  readonly QUALITY = 1;
  readonly DELIVERY = 2;
  readonly PRICE = 3;
  readonly COMMUNICATION = 4;
  
  constructor() {
    this.admin = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    this.criteria = new Map();
    
    // Initialize default criteria
    this.criteria.set(this.QUALITY, {
      name: "Quality",
      description: "Product quality assessment",
      weight: 40,
      active: true
    });
    
    this.criteria.set(this.DELIVERY, {
      name: "Delivery",
      description: "On-time delivery assessment",
      weight: 30,
      active: true
    });
    
    this.criteria.set(this.PRICE, {
      name: "Price",
      description: "Price competitiveness",
      weight: 20,
      active: true
    });
    
    this.criteria.set(this.COMMUNICATION, {
      name: "Communication",
      description: "Responsiveness and clarity",
      weight: 10,
      active: true
    });
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
  
  setCriteria(criteriaId: number, name: string, description: string, weight: number, active: boolean, caller: string) {
    if (caller !== this.admin) {
      return { error: 1 };
    }
    if (weight > 100) {
      return { error: 2 };
    }
    
    this.criteria.set(criteriaId, {
      name,
      description,
      weight,
      active
    });
    return { value: true };
  }
  
  getCriteria(criteriaId: number) {
    return this.criteria.get(criteriaId);
  }
  
  isActiveCriteria(criteriaId: number) {
    const criteria = this.criteria.get(criteriaId);
    return criteria ? criteria.active : false;
  }
  
  getWeight(criteriaId: number) {
    const criteria = this.criteria.get(criteriaId);
    return criteria ? criteria.weight : 0;
  }
}

describe('Performance Criteria Contract', () => {
  let contract: PerformanceCriteriaMock;
  const admin = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const nonAdmin = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  
  beforeEach(() => {
    contract = new PerformanceCriteriaMock();
  });
  
  it('should initialize with default criteria', () => {
    expect(contract.getCriteria(contract.QUALITY)).toBeDefined();
    expect(contract.getCriteria(contract.DELIVERY)).toBeDefined();
    expect(contract.getCriteria(contract.PRICE)).toBeDefined();
    expect(contract.getCriteria(contract.COMMUNICATION)).toBeDefined();
    
    expect(contract.getCriteria(contract.QUALITY)?.name).toBe('Quality');
    expect(contract.getCriteria(contract.DELIVERY)?.weight).toBe(30);
  });
  
  it('should allow admin to update criteria', () => {
    const result = contract.setCriteria(
        contract.QUALITY,
        'Enhanced Quality',
        'Comprehensive quality evaluation',
        45,
        true,
        admin
    );
    
    expect(result).toEqual({ value: true });
    expect(contract.getCriteria(contract.QUALITY)?.name).toBe('Enhanced Quality');
    expect(contract.getCriteria(contract.QUALITY)?.weight).toBe(45);
  });
  
  it('should not allow non-admin to update criteria', () => {
    const result = contract.setCriteria(
        contract.QUALITY,
        'Enhanced Quality',
        'Comprehensive quality evaluation',
        45,
        true,
        nonAdmin
    );
    
    expect(result).toEqual({ error: 1 });
    expect(contract.getCriteria(contract.QUALITY)?.name).toBe('Quality'); // Unchanged
  });
  
  it('should not allow weights greater than 100', () => {
    const result = contract.setCriteria(
        contract.QUALITY,
        'Quality',
        'Product quality assessment',
        110,
        true,
        admin
    );
    
    expect(result).toEqual({ error: 2 });
  });
  
  it('should correctly report if criteria is active', () => {
    // Set criteria to inactive
    contract.setCriteria(contract.PRICE, 'Price', 'Price competitiveness', 20, false, admin);
    
    expect(contract.isActiveCriteria(contract.QUALITY)).toBe(true);
    expect(contract.isActiveCriteria(contract.PRICE)).toBe(false);
    expect(contract.isActiveCriteria(99)).toBe(false); // Non-existent criteria
  });
  
  it('should correctly report criteria weights', () => {
    expect(contract.getWeight(contract.QUALITY)).toBe(40);
    expect(contract.getWeight(contract.DELIVERY)).toBe(30);
    expect(contract.getWeight(99)).toBe(0); // Non-existent criteria
  });
});
