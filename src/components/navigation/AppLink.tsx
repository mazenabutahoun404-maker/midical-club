import { forwardRef, type AnchorHTMLAttributes } from "react";
import { Link, type LinkProps } from "react-router-dom";
type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  state?: LinkProps["state"];
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
