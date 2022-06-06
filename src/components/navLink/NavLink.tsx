import { LinkProps, useResolvedPath, useMatch, Link } from "react-router-dom";

export default function NavLink({ children, to, ...props }: LinkProps) {
  let resolved = useResolvedPath(to);
  let match = useMatch({ path: resolved.pathname, end: true });

  return (
    <div>
      <Link
        className={match ? "link--active" : ""}
        to={to}
        {...props}
      >
        {children}
      </Link>
    </div>
  );
}
