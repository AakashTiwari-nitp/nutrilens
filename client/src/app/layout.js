import Navbar from "@/components/Sidebar";
import "./globals.css";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Nutrilens",
  description: "An App to Analyze Nutritional Value of Food",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={``}
      >
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
