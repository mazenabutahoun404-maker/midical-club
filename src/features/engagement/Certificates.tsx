import { useState } from "react";
import { useParams } from "react-router-dom";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { Button } from "../../components/ui/button";
import {
  useEngagementConnection,
  useEngagementQuery,
  QueryStatus,
  Panel,
  Pager,
  Empty,
  rows,
} from "./shared";
import { string } from "../../services/api/mapping";
import { AssetAction } from "./Events";
export function MyCertificates() {
  const { owner, session } = useEngagementConnection();
  return <CertificateList key={String(owner) + session} />;
}
function CertificateList() {
  const { api } = useEngagementConnection(),
    { t } = useLocale(),
    [page, setPage] = useState(1),
    [id, setId] = useState(""),
    list = useEngagementQuery(
      "my-certificates",
      (signal) =>
        api.get_api_v1_certificates_my({
          query: { Page: page, PageSize: 20 },
          signal,
        }),
      page,
      true,
      true,
    ),
    detail = useEngagementQuery(
      "my-certificate",
      (signal) =>
        api.get_api_v1_certificates_my_by_id({ path: { id }, signal }),
      id,
      !!id,
      true,
    );
  return (
    <div className="container engagement-page">
      <header>
        <h1 data-page-heading tabIndex={-1}>
          {t({ en: "My certificates", ar: "شهاداتي" })}
        </h1>
        <AppLink href="/my/events">
          {t({ en: "My events", ar: "فعالياتي" })}
        </AppLink>
      </header>
      <QueryStatus query={list} />
      {list.data && (
        <>
          {rows(list.data.items).map((row) => (
            <button
              className="engagement-record"
              key={string(row.id)}
              onClick={() => setId(string(row.id))}
            >
              <strong>{string(row.status)}</strong>
              <span>
                {string(row.issuedAt)} · …
                {string(row.verificationCodeDisplaySuffix)}
              </span>
              {row.superseded === true && (
                <span>{t({ en: "Superseded", ar: "مستبدلة" })}</span>
              )}
            </button>
          ))}
          <Empty items={rows(list.data.items)} />
          <Pager
            page={page}
            total={Number(list.data.totalItems)}
            onChange={setPage}
          />
        </>
      )}
      {id && (
        <Panel title={t({ en: "Certificate details", ar: "تفاصيل الشهادة" })}>
          <QueryStatus query={detail} />
          {detail.data && (
            <>
              <h2>{detail.data.eventTitleSnapshot}</h2>
              <p>{detail.data.recipientNameSnapshot}</p>
              <p>
                {detail.data.eventDateSnapshot} · {detail.data.status}
              </p>
              {detail.data.superseded && (
                <p>
                  {t({
                    en: "This certificate has been superseded.",
                    ar: "استُبدلت هذه الشهادة.",
                  })}
                </p>
              )}
              {detail.data.revokedAt && (
                <p>
                  {t({ en: "Revoked", ar: "ملغاة" })}: {detail.data.revokedAt} ·{" "}
                  {detail.data.revocationReason}
                </p>
              )}
              {detail.data.pdfAssetId && (
                <AssetAction
                  assetId={detail.data.pdfAssetId}
                  download
                  label={t({
                    en: "Load certificate download",
                    ar: "تحميل رابط الشهادة",
                  })}
                />
              )}
              {detail.data.verificationCode && (
                <AppLink
                  href={
                    "/certificates/verify/" +
                    encodeURIComponent(detail.data.verificationCode)
                  }
                >
                  {t({ en: "Public verification", ar: "التحقق العام" })}
                </AppLink>
              )}
            </>
          )}
        </Panel>
      )}
    </div>
  );
}
export function VerifyCertificate() {
  const { code: route } = useParams(),
    { api } = useEngagementConnection(),
    { t } = useLocale(),
    [input, setInput] = useState(route || ""),
    [code, setCode] = useState(route || ""),
    q = useEngagementQuery(
      "verify-certificate",
      (signal) =>
        api.get_api_v1_certificates_verify_by_code({ path: { code }, signal }),
      code,
      !!code,
    );
  return (
    <div className="container engagement-page">
      <header>
        <h1 data-page-heading tabIndex={-1}>
          {t({ en: "Verify a certificate", ar: "التحقق من شهادة" })}
        </h1>
      </header>
      <form
        className="engagement-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          if (code === input.trim()) void q.refetch();
          else setCode(input.trim());
        }}
      >
        <label>
          {t({ en: "Verification code", ar: "رمز التحقق" })}
          <input
            required
            maxLength={256}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </label>
        <Button type="submit">{t({ en: "Verify", ar: "تحقق" })}</Button>
      </form>
      {code && (
        <>
          <QueryStatus query={q} />
          {q.data && (
            <Panel
              title={t(
                q.data.valid
                  ? { en: "Valid certificate", ar: "شهادة سارية" }
                  : { en: "Certificate is not valid", ar: "الشهادة غير سارية" },
              )}
            >
              <p>{q.data.recipientName}</p>
              <p>{q.data.eventTitle}</p>
              <p>{q.data.eventDate}</p>
              <p>{q.data.status}</p>
              {q.data.revokedAt && (
                <p>
                  {q.data.revokedAt} · {q.data.revocationReasonSummary}
                </p>
              )}
            </Panel>
          )}
        </>
      )}
    </div>
  );
}
