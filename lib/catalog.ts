import type { CatalogService, ServiceCategory, ServiceMeta } from "./types";
import { serviceMetas } from "./service-registry";

const soon = (slug: string, title: string, blurb = ""): CatalogService => ({
  slug,
  title,
  blurb,
  status: "coming-soon",
});

export const catalog: readonly ServiceCategory[] = [
  {
    slug: "compute",
    title: "Compute",
    summary: "Run code and workloads — from long-lived servers to event-driven functions and containers.",
    services: [
      soon("ec2", "EC2", "Instances, AMIs, auto scaling"),
      soon("lambda", "Lambda", "Serverless functions, triggers"),
      soon("ecs-fargate", "ECS / Fargate", "Containers, task definitions"),
      soon("eks", "EKS", "Managed Kubernetes"),
      soon("elastic-beanstalk", "Elastic Beanstalk", "PaaS deployments"),
    ],
  },
  {
    slug: "storage",
    title: "Storage",
    summary: "Durable object, block, file, and archival storage.",
    services: [
      soon("s3", "S3", "Buckets, storage classes, lifecycle"),
      soon("ebs", "EBS", "Block volumes"),
      soon("efs", "EFS", "Shared file storage"),
      soon("glacier", "Glacier", "Archival"),
    ],
  },
  {
    slug: "networking",
    title: "Networking & Content Delivery",
    summary: "Connect, route, and deliver traffic to your workloads.",
    services: [
      {
        slug: "vpc",
        title: "VPC",
        blurb: "Subnets, routing, security groups",
        status: "available",
      },
      soon("route-53", "Route 53", "DNS, routing policies"),
      soon("cloudfront", "CloudFront", "CDN, edge caching"),
      soon("api-gateway", "API Gateway", "REST/HTTP APIs, throttling"),
      soon("elb", "Elastic Load Balancing", "ALB, NLB, GLB"),
    ],
  },
  {
    slug: "databases",
    title: "Databases",
    summary: "Managed relational, NoSQL, caching, and analytics data stores.",
    services: [
      soon("rds", "RDS / Aurora", "Managed relational"),
      soon("dynamodb", "DynamoDB", "NoSQL, partition keys, GSIs"),
      soon("elasticache", "ElastiCache", "Redis / Memcached"),
      soon("redshift", "Redshift", "Data warehousing"),
    ],
  },
  {
    slug: "security-identity",
    title: "Security & Identity",
    summary: "Control who can do what, and protect data and workloads.",
    services: [
      {
        slug: "iam",
        title: "IAM",
        blurb: "Users, roles, policies, evaluation",
        status: "available",
      },
      soon("cognito", "Cognito", "User pools, identity pools"),
      soon("kms", "KMS", "Key management, envelope encryption"),
      soon("secrets-manager", "Secrets Manager / Parameter Store", "Secrets, config"),
      soon("waf-shield", "WAF & Shield", "Web protection"),
    ],
  },
  {
    slug: "messaging",
    title: "Application Integration & Messaging",
    summary: "Decouple services with queues, topics, event buses, and workflows.",
    services: [
      soon("sqs", "SQS", "Queues, visibility timeout, DLQs"),
      soon("sns", "SNS", "Pub/sub, fan-out"),
      soon("eventbridge", "EventBridge", "Event bus, rules"),
      soon("step-functions", "Step Functions", "State machines"),
      soon("kinesis", "Kinesis", "Streaming"),
    ],
  },
  {
    slug: "monitoring",
    title: "Monitoring & Management",
    summary: "Observe, audit, and provision your infrastructure.",
    services: [
      soon("cloudwatch", "CloudWatch", "Metrics, logs, alarms"),
      soon("cloudtrail", "CloudTrail", "Audit logging"),
      soon("cloudformation", "CloudFormation / CDK", "Infrastructure as code"),
    ],
  },
  {
    slug: "foundations",
    title: "Cross-cutting Foundations",
    summary: "The concepts that underpin every service.",
    services: [
      soon("global-infrastructure", "Global Infrastructure", "Regions, AZs, edge"),
      soon("well-architected", "Well-Architected Framework", "Six pillars"),
      soon("shared-responsibility", "Shared Responsibility Model", ""),
      soon("pricing", "Pricing & Cost Optimization", ""),
    ],
  },
];

export function getCategory(slug: string): ServiceCategory | undefined {
  return catalog.find((category) => category.slug === slug);
}

export function getServiceMeta(slug: string): ServiceMeta | undefined {
  return serviceMetas[slug];
}

export function allCatalogServices(): { categorySlug: string; service: CatalogService }[] {
  return catalog.flatMap((category) =>
    category.services.map((service) => ({ categorySlug: category.slug, service })),
  );
}

// Re-exported so consumers can import types from one module.
export type { ServiceMeta } from "./types";

// Re-exported so consumers can import the registry from the catalog module.
export { serviceMetas };
