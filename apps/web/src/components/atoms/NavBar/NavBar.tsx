import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export interface NavLink {
  /** Display label */
  label: string;
  /** Route path */
  to: string;
}

export interface NavBarProps {
  /** Navigation links to render */
  links: NavLink[];
  /** Optional brand/logo slot */
  brand?: ReactNode;
}

/**
 * NavBar atom — a fully presentational top navigation bar primitive.
 *
 * Accepts all link data and the optional brand slot via props.
 * Uses React Router's `<Link>` for client-side navigation but contains
 * no routing logic, store calls, or data-fetching.
 */
const NavBar = ({ links, brand }: NavBarProps) => (
  <nav
    className="flex items-center gap-6 px-6 py-3"
    aria-label="Main navigation"
  >
    {brand && <div className="mr-auto">{brand}</div>}
    <ul className="flex list-none items-center gap-6 p-0 m-0">
      {links.map(({ label, to }) => (
        <li key={to}>
          <Link
            to={to}
            className="text-sm font-medium text-text no-underline transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
);

export default NavBar;
