import type { ReactNode } from 'react';

export interface MainLayoutProps {
  /** Main page content */
  children: ReactNode;
  /** Optional header slot */
  header?: ReactNode;
  /** Optional footer slot */
  footer?: ReactNode;
}

/**
 * MainLayout template — provides a full-height column layout with optional
 * header and footer slots. Contains no data-fetching logic; accepts all
 * content via props.
 */
const MainLayout = ({ children, header, footer }: MainLayoutProps) => (
  <div className="flex min-h-screen flex-col bg-bg text-text">
    {header && <header className="border-b border-border">{header}</header>}
    <main className="flex flex-1 flex-col">{children}</main>
    {footer && <footer className="border-t border-border">{footer}</footer>}
  </div>
);

export default MainLayout;
