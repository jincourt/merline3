import type { VisibleContactInfo } from "@/lib/profile-contact";

type ProfileContactInfoProps = {
  contact: VisibleContactInfo;
  className?: string;
};

function ContactRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="profile-contact-row">
      <span className="profile-contact-label">{label}</span>
      {href ? (
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          className="profile-contact-value profile-contact-link"
        >
          {value}
        </a>
      ) : (
        <span className="profile-contact-value">{value}</span>
      )}
    </div>
  );
}

export function ProfileContactInfo({
  contact,
  className = "",
}: ProfileContactInfoProps) {
  const rows = [
    contact.email
      ? { label: "Email", value: contact.email, href: `mailto:${contact.email}` }
      : null,
    contact.phone
      ? { label: "Téléphone", value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` }
      : null,
    contact.website
      ? { label: "Site internet", value: contact.website, href: contact.website }
      : null,
    contact.address
      ? { label: "Adresse", value: contact.address }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string; href?: string }>;

  if (rows.length === 0 && !contact.description) return null;

  return (
    <section className={`profile-contact-info ${className}`.trim()}>
      <h2 className="public-profile-section-title">Contact</h2>
      {rows.length > 0 ? (
        <div className="profile-contact-list">
          {rows.map((row) => (
            <ContactRow key={row.label} {...row} />
          ))}
        </div>
      ) : null}
      {contact.description ? (
        <div className="profile-contact-description">
          <p className="profile-contact-label">Description</p>
          <p className="profile-contact-description-text">{contact.description}</p>
        </div>
      ) : null}
    </section>
  );
}
