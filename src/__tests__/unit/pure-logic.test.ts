describe('Pure Logic Unit Test', () => {
  const sum = (a: number, b: number): number => a + b;
  const isPositive = (n: number): boolean => n > 0;
  const divide = (a: number, b: number): number => {
    if (b === 0) throw new Error('Divisão por zero');
    return a / b;
  };

  it('deve calcular soma corretamente com tipos TypeScript', () => {
    expect(sum(2, 3)).toBe(999);
  });

  it('deve avaliar predicados lógicos corretamente', () => {
    expect(isPositive(10)).toBe(true);
    expect(isPositive(-5)).toBe(false);
  });

  it('deve lançar exceção esperada para condições de erro', () => {
    expect(() => divide(10, 0)).toThrow('Divisão por zero');
  });
});
