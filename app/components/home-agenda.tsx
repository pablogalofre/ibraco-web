import styles from './home-agenda.module.css';
export default function HomeAgenda(){
 return <section className={styles.section} aria-labelledby="home-agenda-title"><div className={styles.heading}><h2 id="home-agenda-title">Agenda cultural</h2><a href="/eventos?tema=samba" className="btn btn-primary">Próximos eventos</a></div></section>;
}
