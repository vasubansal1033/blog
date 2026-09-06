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
  /** Public booking page. Opens in a new tab. */
  bookingUrl: string;
  /** Phase 2 LLM proxy. Empty = hide chat widget. */
  chatProxyUrl: string;
}

export const RECRUITER: RecruiterData = {
  name: "Vasu Bansal",
  headline:
    "Backend/Infra. 5+ years @ Nutanix, Gojek, Deloitte, IIT Kanpur. Self-learner and curious.",
  location: "India",
  pitch:
    "Hi, I'm Vasu. I am a backend engineer with infra experience as well. Right now that's at Nutanix. Before this I was at Gojek where I worked on a multi-tenant KYC platform with a focus on scale and reliability, and I started out at Deloitte straight after college.\n\nMy daily work involves working with Go, Spring Boot microservices along with Kafka, Postgres, Redis and Kubernetes. I've been leading the IAM control-plane migration work in my current role at Nutanix involving Kubernetes, Helm charts, Envoy, OIDC.\n\nIn my free time, I like to understand how various systems work. I'm also interested in AI and how LLMs work and basic Agentic AI concepts.\n\nIf you're hiring for backend, infra, data engineering, or Agentic AI related roles (I'm still learning this one), this page is a quick overview. Please refer to my resume for more details.",
  metrics: [
    { value: "5+", label: "Years doing this" },
    { value: "Nutanix", label: "MTS-3, currently working" },
    { value: "Prior", label: "Gojek and Deloitte" },
    { value: "IIT Kanpur", label: "Mech + Aero, 2016–21" },
  ],
  skills: [
    "Go",
    "Spring Boot",
    "Ruby on Rails",
    "Java",
    "Python",
    "Kafka",
    "Redis",
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
      period: "Now (2025-present)",
      summary:
        "Backend and infra. Services, Kubernetes, IAM, OIDC control-plane migration work.",
    },
    {
      org: "Gojek",
      title: "Backend",
      period: "Before Nutanix (2022-25)",
      summary:
        "Multi-tenant KYC platform orchestrating ML models using Actor-concurrency based framework. Typical backend, scale, ops work with Kafka, Postgres, Redis, and Kubernetes.",
    },
    {
      org: "Deloitte",
      title: "Engineer",
      period: "First job (2021-22)",
      summary:
        "Where I started after college, in 2021. Python automation and Java backend work.",
    },
    {
      org: "IIT Kanpur",
      title: "B.Tech, Mechanical + Aerospace",
      period: "2016–2021",
      summary:
        "Not a traditional CS degree. The software interest came in my final year.",
    },
  ],
  resumeHref: "/resume.pdf",
  email: "vasubansal1998@gmail.com",
  linkedinHref: "https://www.linkedin.com/in/vasub-iitk/",
  bookingUrl: "https://calendar.app.google/BXzB9rtHZ8mZFWbD9",
  chatProxyUrl: "",
};
