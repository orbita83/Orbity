describe('Alias @/assets no Jest', () => {
  it('resolve imagens da pasta assets/ na raiz, e não em src/assets/', () => {
    // A regra genérica `@/*` não pode capturar `@/assets/*` antes da regra específica.
    expect(() => require('@/assets/app/icon/icon.png')).not.toThrow();
  });
});
