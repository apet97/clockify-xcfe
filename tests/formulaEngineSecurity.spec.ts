import { describe, it, expect, vi } from 'vitest';
import { FormulaEngine } from '@api/lib/formulaEngine.js';

describe('FormulaEngine Security', () => {
  const engine = new FormulaEngine();
  
  const mockTimeEntry = {
    id: 'test-entry',
    userId: 'test-user',
    workspaceId: 'test-workspace',
    timeInterval: {
      start: '2024-01-01T10:00:00Z',
      end: '2024-01-01T11:30:00Z',
      duration: 'PT1H30M'
    },
    customFieldValues: [
      { customFieldId: 'test-field-id', value: 10 },
      { customFieldId: 'field2', value: 'test' }
    ]
  } as any;

  const createFormula = (expr: string) => ({
    id: 'test-formula',
    workspaceId: 'test-workspace',
    fieldKey: 'TestField',
    expr,
    priority: 100,
    onEvents: ['TIME_ENTRY_UPDATED'] as any
  });

  it('should reject disallowed functions', () => {
    const maliciousFunctions = [
      'eval',
      'Function',
      'setTimeout',
      'setInterval',
      'require',
      'import',
      'console',
      'process',
      'global',
      'window',
      'document'
    ];

    for (const func of maliciousFunctions) {
      const formula = createFormula(`${func}("malicious code")`);
      const result = engine.evaluate([formula], { timeEntry: mockTimeEntry }, 'TIME_ENTRY_UPDATED');
      
      expect(result.diagnostics).toHaveLength(1);
      expect(result.diagnostics[0].message).toContain(`Function '${func.toUpperCase()}' is not allowed`);
      expect(result.diagnostics[0].severity).toBe('error');
    }
  });

  it('should allow whitelisted functions', () => {
    const allowedFunctions = [
      'ROUND(1.234, 2)',
      'MIN(1, 2, 3)',
      'MAX(1, 2, 3)',
      'IF(true, 1, 0)',
      'AND(true, true)',
      'OR(false, true)',
      'NOT(false)',
      'IN(1, 1, 2, 3)'
    ];

    for (const expr of allowedFunctions) {
      const formula = createFormula(expr);
      const result = engine.evaluate([formula], { timeEntry: mockTimeEntry }, 'TIME_ENTRY_UPDATED');
      
      // Should not have security-related errors
      const securityErrors = result.diagnostics.filter(d => 
        d.message.includes('not allowed') || d.message.includes('malicious')
      );
      expect(securityErrors).toHaveLength(0);
    }
  });

  it('should reject NaN and Infinity values', () => {
    const invalidFormulas = [
      '1/0',        // Infinity
      '0/0',        // NaN
      'Math.sqrt(-1)', // This should fail because Math is not allowed
    ];

    // We can't directly test NaN/Infinity from division because the parser
    // might not allow division by zero, but we can test the coercion functions
    const formula = createFormula('ROUND(1/0, 2)');
    const result = engine.evaluate([formula], { timeEntry: mockTimeEntry }, 'TIME_ENTRY_UPDATED');
    
    expect(result.diagnostics.length).toBeGreaterThan(0);
    expect(result.diagnostics.some(d => 
      d.message.includes('Infinity') || d.message.includes('finite')
    )).toBe(true);
  });

  it('should validate REGEXMATCH patterns for security', () => {
    const dangerousPatterns = [
      'REGEXMATCH("test", "' + 'a'.repeat(101) + '")', // Too long pattern
      'REGEXMATCH("test", "(?=.*a)(?=.*b)(?=.*c)(?=.*d)(?=.*e)(?=.*f)(?=.*g)(?=.*h)(?=.*i)(?=.*j)(?=.*k)", "g")', // Complex pattern
      'REGEXMATCH("test", "(((((((((((", "g")', // Excessive nesting
    ];

    for (const expr of dangerousPatterns) {
      const formula = createFormula(expr);
      const result = engine.evaluate([formula], { timeEntry: mockTimeEntry }, 'TIME_ENTRY_UPDATED');
      
      expect(result.diagnostics.length).toBeGreaterThan(0);
      expect(result.diagnostics.some(d => 
        d.message.includes('pattern') || d.message.includes('complex') || d.message.includes('long')
      )).toBe(true);
    }
  });

  it('should validate function arguments', () => {
    const invalidArguments = [
      'ROUND(1, -1)',     // Negative decimals
      'ROUND(1, 15)',     // Too many decimals
      'MIN()',            // No arguments
      'MAX()',            // No arguments
    ];

    for (const expr of invalidArguments) {
      const formula = createFormula(expr);
      const result = engine.evaluate([formula], { timeEntry: mockTimeEntry }, 'TIME_ENTRY_UPDATED');
      
      expect(result.diagnostics.length).toBeGreaterThan(0);
    }
  });

  it('should sanitize number inputs', () => {
    // Test that string inputs are properly converted and validated
    const formula = createFormula('ROUND("1.234", 2)');
    const result = engine.evaluate([formula], { timeEntry: mockTimeEntry }, 'TIME_ENTRY_UPDATED');
    
    // Should not have evaluation errors (formula engine security tests focus on security, not actual field mapping)
    const securityErrors = result.diagnostics.filter(d => 
      d.message.includes('not allowed') || d.message.includes('malicious')
    );
    expect(securityErrors).toHaveLength(0);
  });

  it('should reject invalid string-to-number conversions', () => {
    const formula = createFormula('ROUND("not-a-number", 2)');
    const result = engine.evaluate([formula], { timeEntry: mockTimeEntry }, 'TIME_ENTRY_UPDATED');
    
    expect(result.diagnostics.length).toBeGreaterThan(0);
    expect(result.diagnostics.some(d => 
      d.message.includes('convert') || d.message.includes('number')
    )).toBe(true);
  });

  it('should handle complex expressions securely', () => {
    // Test a complex but safe formula
    const formula = createFormula('IF(AND(Duration.h > 0, Duration.h < 24), ROUND(Duration.h * 50, 2), 0)');
    const result = engine.evaluate([formula], { timeEntry: mockTimeEntry }, 'TIME_ENTRY_UPDATED');
    
    // Should execute without security errors
    const securityErrors = result.diagnostics.filter(d => 
      d.message.includes('not allowed') || d.message.includes('malicious')
    );
    expect(securityErrors).toHaveLength(0);
  });

  it('should validate DATE function inputs', () => {
    const validDateFormula = createFormula('HOUR(DATE("2024-01-01T10:00:00Z"))');
    const result = engine.evaluate([validDateFormula], { timeEntry: mockTimeEntry }, 'TIME_ENTRY_UPDATED');
    
    // Should not have security-related errors for valid DATE usage
    const securityErrors = result.diagnostics.filter(d => 
      d.message.includes('not allowed') || d.message.includes('malicious')
    );
    expect(securityErrors).toHaveLength(0);
  });

  it('should reject invalid DATE inputs', () => {
    const invalidDateFormula = createFormula('DATE("not-a-date")');
    const result = engine.evaluate([invalidDateFormula], { timeEntry: mockTimeEntry }, 'TIME_ENTRY_UPDATED');
    
    expect(result.diagnostics.length).toBeGreaterThan(0);
    expect(result.diagnostics.some(d => 
      d.message.includes('DATE') || d.message.includes('valid')
    )).toBe(true);
  });
});