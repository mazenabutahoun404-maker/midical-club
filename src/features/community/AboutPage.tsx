import {useServices} from "../../app/providers/ServicesProvider";
import {PublicAbout} from "../publications/Publications";
import { BookOpenCheck, HeartHandshake, ShieldCheck } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { CommunityNavigation } from "../../components/navigation/CommunityNavigation";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { Notice } from "../../components/feedback/Notice";
import { useClubValues } from "../../hooks/useContent";
import logo from "../../assets/brand/medclub-logo.png";

const icons = [BookOpenCheck, HeartHandshake, ShieldCheck];

function PreviewAboutPage() {
  const { t, label } = useLocale();
  const query = useClubValues();
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  return (
    <div className="community-v5 community-index-page about-community-page container">
      <CommunityNavigation />
      <header className="community-page-intro about-intro">
        <div>
          <span className="eyebrow">{label("aboutEyebrow")}</span>
          <h1 tabIndex={-1} data-page-heading>
            {label("aboutTitle")}
          </h1>
          <p>{label("aboutBody")}</p>
        </div>
        <div className="about-logo-orbit" aria-hidden="true">
          <i />
          <i />
          <span>
            <img src={logo} alt="" />
          </span>
        </div>
      </header>
      <section className="about-story">
        <span className="eyebrow">{label("ourStory")}</span>
        <h2>{label("communityTitle")}</h2>
        <p>{label("ourStoryBody")}</p>
      </section>
      <section className="club-values">
        <header>
          <span className="eyebrow">{label("ourValues")}</span>
          <h2>{label("communitySignalBody")}</h2>
        </header>
        <div>
          {query.data?.map((value, index) => {
            const Icon = icons[index] || ShieldCheck;
            return (
              <article key={value.id}>
                <span aria-hidden="true">
                  <Icon size={22} />
                  <i />
                </span>
                <h3>{t(value.title)}</h3>
                <p>{t(value.description)}</p>
              </article>
            );
          })}
        </div>
      </section>
      <Notice>{label("communityPreviewNotice")}</Notice>
    </div>
  );
}

export default function AboutPage(){return useServices().publicationApi?<PublicAbout/>:<PreviewAboutPage/>;}
