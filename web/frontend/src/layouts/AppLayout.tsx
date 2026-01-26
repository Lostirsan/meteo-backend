import Header from "../components/Header";
import "./appLayout.css";

type Props = {
  children: React.ReactNode;
  title?: string;
};

export default function AppLayout({ children, title }: Props) {
  return (
    <div className="app-layout">
      <Header />

      <main className="app-main">
        {title && <h1 className="page-title">{title}</h1>}
        {children}
      </main>
    </div>
  );
}
