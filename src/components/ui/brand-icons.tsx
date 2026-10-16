import { siGithub, siInstagram, siWhatsapp } from "simple-icons";

type IconProps = React.SVGProps<SVGSVGElement>;

function Brand({ path, ...props }: IconProps & { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d={path} />
    </svg>
  );
}

export const GithubIcon = (p: IconProps) => <Brand path={siGithub.path} {...p} />;
export const InstagramIcon = (p: IconProps) => <Brand path={siInstagram.path} {...p} />;
export const WhatsappIcon = (p: IconProps) => <Brand path={siWhatsapp.path} {...p} />;

// simple-icons no longer ships LinkedIn, so this is a generic "in" glyph.
export const LinkedinIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm2.2 6.4v8.4h2.6V9.4H6.2ZM7.5 5.9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm3.1 3.5v8.4h2.6v-4.4c0-1.2.5-1.9 1.4-1.9.9 0 1.3.6 1.3 1.8v4.5h2.6v-5c0-2.2-1.1-3.5-3-3.5-1.1 0-1.9.5-2.3 1.2V9.4h-2.6Z" />
  </svg>
);
