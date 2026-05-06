import Breadcrumb from '../components/ui/Breadcrumb'
import { IDEAS } from '../data/products'

function IdeasPage() {
  return (
    <main>
      <Breadcrumb current="Ideas y soluciones" />
      <section className="section section--gray">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">💡 Ideas y soluciones</h2>
            <p className="section__subtitle">Guías y consejos para tus proyectos</p>
          </div>
          <div className="ideas-grid">
            {IDEAS.map((idea, i) => (
              <div key={i} className="idea-card">
                <div className="idea-card__img">
                  <img src={idea.img} alt={idea.title} loading="lazy" />
                  <span className="idea-card__tag">{idea.tag}</span>
                </div>
                <div className="idea-card__body">
                  <h3 className="idea-card__title">{idea.title}</h3>
                  <p className="idea-card__desc">{idea.desc}</p>
                  <div className="idea-card__footer">
                    <span>⏱ {idea.tiempo}</span>
                    <button className="idea-card__btn">Ver guía →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default IdeasPage