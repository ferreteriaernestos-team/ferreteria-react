function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer__logo">Ferretería <span>Ernesto's</span></div>
            <p>Tu ferretería de confianza desde 1995. Calidad y servicio garantizado.</p>
            <div className="footer__socials">
              <a href="#" className="footer__social" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href="#" className="footer__social" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" className="footer__social" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
              </a>
            </div>
          </div>
          <div className="footer__col">
            <h4>Información</h4>
            <ul>
              <li><a href="#">Sobre nosotros</a></li>
              <li><a href="#">Términos y condiciones</a></li>
              <li><a href="#">Política de privacidad</a></li>
              <li><a href="#">Política de devoluciones</a></li>
              <li><a href="#">Preguntas frecuentes</a></li>
            </ul>
          </div>
          <div className="footer__col">
            <h4>Servicio al cliente</h4>
            <ul>
              <li><a href="#">Rastrear pedido</a></li>
              <li><a href="#">Envíos y entregas</a></li>
              <li><a href="#">Métodos de pago</a></li>
              <li><a href="#">Garantías</a></li>
              <li><a href="#">Contacto</a></li>
            </ul>
          </div>
          <div className="footer__col">
            <h4>Contacto</h4>
            <ul className="footer__contact">
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3"/></svg>
                Av. Principal, Santa Ana, El Salvador
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                +503 2222-3333
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                info@ferreteriaernestos.com
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container" style={{padding:0}}>
            <p>© 2026 Ferretería Ernesto's. Todos los derechos reservados.</p>
            <div className="footer__payments">
              <span>Métodos de pago:</span>
              <div className="payment-badge">VISA</div>
              <div className="payment-badge">MC</div>
              <div className="payment-badge">AMEX</div>
              <div className="payment-badge">PayPal</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer