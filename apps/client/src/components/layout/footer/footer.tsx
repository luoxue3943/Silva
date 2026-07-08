import { getConfig } from "@/lib/config";
import FooterStatsClient from "./footer-stats-client";
import Modules from "./footer.module.scss";

export default async function Footer() {
  const config = await getConfig();

  const registrations = config.registration ?? [];

  return (
    <div className={Modules.footer}>
      <div className={Modules.container}>
        <div className={Modules.stats}>
          <FooterStatsClient highlightClassName={Modules.highlight} />
        </div>

        {registrations.length > 0 && (
          <div className={Modules.registrations}>
            {registrations.map((item) => (
              <a
                key={item.url}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.name}
              </a>
            ))}
          </div>
        )}

        <div className={Modules.copyright}>
          <p>
            Copyright (c) {new Date().getFullYear()} {config.siteAuthor}.
          </p>
        </div>
      </div>
    </div>
  );
}
