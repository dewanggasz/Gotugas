describe('Login Flow', () => {
  it('should allow a user to log in and see the dashboard', () => {
    // 1. Intercept: Beri tahu Cypress untuk "mengawasi" panggilan API login
    cy.intercept('POST', '**/api/login').as('loginRequest');

    // 2. Kunjungi halaman (pastikan baseUrl sudah diatur di cypress.config.js)
    cy.visit('/');

    // 3. Isi form
    cy.get('input#email').type('admin@example.com');
    cy.get('input#password').type('password');

    // 4. Klik tombol login
    cy.get('button[type="submit"]').click();

    // 5. Wait: Perintahkan Cypress untuk menunggu hingga 'loginRequest' selesai.
    // Gunakan .then() untuk memastikan verifikasi berjalan setelah wait selesai.
    cy.wait('@loginRequest', { timeout: 10000 }).then((interception) => {
      // Pastikan status code adalah 200 (OK)
      expect(interception.response.statusCode).to.eq(200);

      // 6. Verifikasi: Sekarang kita bisa yakin halaman sudah berganti.
      // Tambahkan timeout di sini juga untuk memberi waktu render pada React.
      cy.contains('h1', 'My Tasks', { timeout: 10000 }).should('be.visible');
      cy.window().its('localStorage.authToken').should('be.a', 'string');
    });
  });

  it('should show an error on failed login', () => {
    // Intercept untuk request yang gagal
    cy.intercept('POST', '**/api/login').as('failedLoginRequest');
    
    cy.visit('/');

    // Masukkan kredensial yang salah
    cy.get('input#email').type('wrong@example.com');
    cy.get('input#password').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    // Tunggu request selesai dan verifikasi pesan error
    cy.wait('@failedLoginRequest', { timeout: 10000 });
    cy.contains('Login failed. Please check your credentials.', { timeout: 10000 }).should('be.visible');
  });
});
