import { forwardRef, type AnchorHTMLAttributes } from "react";
import { Link } from "react-router-dom";
type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
};
export const AppLink = forwardRef<HTMLAnchorElement, Props>(function AppLink(
  { href, children, ...props },
  ref,
) {
  return (
    <Link ref={ref} to={href} {...props}>
      {children}
    </Link>
  );
});
