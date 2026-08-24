import SlackInstallLandingPage, { metadata as baseMetadata } from "../page";

export const metadata = baseMetadata;

export default async function SlackOrgLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <SlackInstallLandingPage />;
}
