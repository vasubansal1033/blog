export interface RecruiterMetric {
  value: string;
  label: string;
}

export interface RecruiterRole {
  org: string;
  title: string;
  period: string;
  summary: string;
}

export interface RecruiterData {
  name: string;
  headline: string;
  location: string;
  pitch: string;
  metrics: RecruiterMetric[];
  skills: string[];
  roles: RecruiterRole[];
  resumeHref: string;
  email: string;
  linkedinHref: string;
  /** Google Calendar Appointment Schedule URL. Empty = hide iframe. */
  bookingUrl: string;
  /** Phase 2 LLM proxy. Empty = hide chat widget. */
  chatProxyUrl: string;
}

export const RECRUITER: RecruiterData = {
  name: "Vasu Bansal",
  headline: "MTS-3 at Nutanix · Backend & Infra · 5+ years",
  location: "India",
  pitch:
    "IIT Kanpur (B.Tech Mechanical + Aerospace). Backend and infra engineer at Nutanix (MTS-3), previously Gojek and Deloitte. I build microservices in Go, Spring Boot, and Ruby on Rails with Kafka, Postgres, and Kubernetes, and have worked control-plane migrations involving Helm, Envoy, and OIDC.",
  metrics: [
    { value: "5+", label: "Years experience" },
    { value: "IITK", label: "B.Tech, 2016–2021" },
    { value: "MTS-3", label: "Nutanix (current)" },
    { value: "2", label: "Prior: Gojek, Deloitte" },
  ],
  skills: [
    "Go",
    "Spring Boot",
    "Ruby on Rails",
    "Kafka",
    "Postgres",
    "Kubernetes",
    "Helm",
    "Envoy",
    "ELK",
    "OIDC",
  ],
  roles: [
    {
      org: "Nutanix",
      title: "MTS-3",
      period: "Current",
      summary:
        "Backend and infra. Microservices, Kubernetes, and control-plane work.",
    },
    {
      org: "Gojek",
      title: "Backend / Infra",
      period: "Previous",
      summary: "Backend engineering on production services.",
    },
    {
      org: "Deloitte",
      title: "Engineer",
      period: "Previous",
      summary: "Earlier professional role in software engineering.",
    },
    {
      org: "IIT Kanpur",
      title: "B.Tech Mechanical + Aerospace",
      period: "2016–2021",
      summary: "Dual major. Mechanical Engineering and Aerospace Engineering.",
    },
  ],
  resumeHref: "/resume.pdf",
  email: "vasubansal1998@gmail.com",
  linkedinHref: "https://www.linkedin.com/in/vasu-bansal-673030147/",
  bookingUrl: "",
  chatProxyUrl: "",
};
