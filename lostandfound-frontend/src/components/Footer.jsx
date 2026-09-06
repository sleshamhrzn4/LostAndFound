import islington from "../assets/islington.png";

function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-inner">
                <div className="footer-brand">
                    <img src={islington} alt="Islington College" className="footer-logo" />
                    <p className="footer-tagline">
                        A simple, trusted place to reconnect lost belongings with their owners.
                    </p>
                </div>

                <div className="footer-links">
                    <a href="/">Home</a>
                    <a href="/resolved">Resolved</a>
                    <a href="/login">Log in</a>
                </div>

                <div className="footer-meta">
                    <p>Islington College</p>
                    <p>Kamal Pokhari, Kathmandu, Nepal</p>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} Islington College Lost &amp; Found. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;