export default function RootLayout({ children }) {
    return (
        <html lang="fr">
            <body>
                <header>
                    <h1>Apex Collector</h1>
                </header>
                {children}
            </body>
        </html>
    );
}
