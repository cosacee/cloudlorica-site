/**
 * Case studies — the core of the site.
 *
 * Writing rules (enforced by convention, not code):
 *   - Problem → constraints → decisions → outcome. Never "I installed X".
 *   - Every claim needs a number or a verifiable outcome.
 *   - NO internal IPs, hostnames, tokens, account IDs or screenshots of live
 *     dashboards. Use abstractions: `10.x.x.x`, `docker-host`, `edge-proxy`.
 *   - Describe the DECISION, not just the tool. Recruiters care about judgement.
 */

export const caseStudies = [
  {
    slug: 'edge-migration',
    title: 'Migrating 20 public services across a subnet renumber',
    summary:
      'A LAN renumber invalidated routing for every published hostname at once. DNS looked correct while every route was dead — finding the real failure layer took separating three independent config surfaces.',
    metric: '23 ingress rules repointed · 20/22 hostnames verified live',
    stack: ['Cloudflare Tunnel', 'Zero Trust', 'DNS', 'Traefik', 'Linux'],
    role: 'Sole engineer',
    context:
      'A homelab serving roughly twenty self-hosted applications was renumbered from one private /24 to another. Every public hostname was published as a CNAME to a Cloudflare Tunnel, so the DNS zone itself stayed perfectly valid — which is precisely what made the outage confusing.',
    constraints: [
      'No maintenance window — the services were in active daily use.',
      'The tunnel ingress is managed remotely by Cloudflare; the local config file on the connector looked authoritative but was ignored.',
      'A malformed ingress update replaces the entire route table for every hostname simultaneously.',
    ],
    decisions: [
      {
        title: 'Audit the routing layer, not the zone',
        body:
          'A DNS audit came back clean, which was a false negative: every ingress rule carried a hardcoded origin address while every published record was a CNAME to the tunnel. The lesson was to sweep origin addresses, not record types.',
      },
      {
        title: 'Snapshot before mutating',
        body:
          'The full ingress array was exported to disk before any change. Because a PUT replaces all rules at once, a single bad edit can take down every hostname and the API will not say which rule was wrong.',
      },
      {
        title: 'Reconcile in both directions',
        body:
          'Leftover rules pointing at dead services and DNS records with no matching rule both present identically — as the catch-all 404. Each direction had to be enumerated separately to account for every hostname.',
      },
    ],
    outcome: [
      'Ingress reduced from 24 to 23 rules, every origin repointed to the new subnet.',
      '20 of 22 hostnames verified end-to-end; the remaining two were origin service failures, not routing failures — confirming the edge was correct.',
      'Established a rule that a 502 means routing is fixed and the origin is down, while a 404 means no rule matched. That single distinction cut future diagnosis time significantly.',
    ],
    lessons:
      'A clean DNS audit is not evidence that routing works. When a layer reports success, verify the layer beneath it with a direct probe rather than trusting the status code.',
  },

  {
    slug: 'database-recovery',
    title: 'Recovering a corrupt SQLite database — and knowing when not to',
    summary:
      'A media manager began returning HTTP 500. The database was malformed, the most recent backups were also corrupt, and the automatic repair tool produced a file that passed integrity checks but silently destroyed data.',
    metric: 'Recovered to integrity-ok with zero row loss',
    stack: ['SQLite', 'Python', 'Windows services', 'Backup validation'],
    role: 'Sole engineer',
    context:
      'An application returned HTTP 500 on its main listing endpoint. The underlying SQLite database reported corruption with truncated overflow chains in a specific table. Four backups existed, spanning three weeks.',
    constraints: [
      'The service was in daily use and needed to come back up.',
      'Restoring a three-week-old backup risked silently losing recent changes.',
      'The obvious repair tool is not data-preserving, and does not announce that.',
    ],
    decisions: [
      {
        title: 'Validate every backup before choosing one',
        body:
          'All four backups were integrity-checked rather than assuming the newest was good. Two were also corrupt — damage predated the most recent snapshots, so "restore last night" would have restored the fault.',
      },
      {
        title: 'Treat the repair output as suspect until diffed',
        body:
          'The recovery tool produced a database that passed integrity checks and had matching row counts. A column-level comparison revealed it had emptied two JSON columns and destroyed a path column in the corrupted cells. Integrity passing did not mean correct.',
      },
      {
        title: 'Restore the older clean copy, having proved it was complete',
        body:
          'Comparison showed the older backup and the live data were identical in row counts and paths for every table that mattered, so the "older" copy was not stale — it was simply the last clean one.',
      },
    ],
    outcome: [
      'Service restored, integrity check clean, listing endpoint returning 200.',
      'Verified the restore introduced no regression by comparing all three database versions for identical item and file counts.',
      'Documented that two of the four backups must never be restored, so a future reader does not repeat the mistake.',
    ],
    lessons:
      'A passing integrity check proves structural consistency, not data fidelity. Backups that are never validated are not backups.',
  },

  {
    slug: 'dns-latency',
    title: '400ms to 30ms: diagnosing DNS that looked correct',
    summary:
      'Name resolution was slow and some hosts failed entirely. The configured resolvers were valid, publicly reachable, and completely useless from the affected machine — because a VPN was capturing the traffic.',
    metric: '~13x reduction in lookup latency · failure eliminated',
    stack: ['DNS', 'WireGuard', 'Windows networking', 'Packet-level probing'],
    role: 'Sole engineer',
    context:
      'Lookups took roughly 400ms each and at least one hostname failed to resolve. The adapter was configured with the ISP resolvers, which respond normally from other machines on the same network.',
    constraints: [
      'The same resolver IPs worked perfectly from a different host on the same LAN, so "the DNS server is down" was the wrong conclusion.',
      'Changing DNS risks cutting off the machine mid-diagnosis.',
    ],
    decisions: [
      {
        title: 'Test from both vantage points before drawing a conclusion',
        body:
          'Raw DNS queries from the affected machine timed out on both UDP and TCP/53, while identical queries from the hypervisor returned NOERROR. The resolver was fine; the path to it was not.',
      },
      {
        title: 'Follow the route, not the config',
        body:
          'A route lookup showed traffic to the ISP resolvers was being sent into the VPN tunnel, where it was dropped. The configured DNS was therefore dead whenever the VPN was connected, and the OS was silently falling back to the tunnel resolver after paying a timeout.',
      },
      {
        title: 'Measure the fix rather than assert it',
        body:
          'After repointing to resolvers that are reachable in both network states, latency was measured inside a single process to avoid including shell startup cost — an easy way to misread a 30ms improvement as a 400ms non-event.',
      },
    ],
    outcome: [
      'Lookup latency reduced from ~400ms to ~30ms, measured warm and cold.',
      'The one hostname that still failed was confirmed not to exist at all — the test name was invalid, not the resolver.',
      'Left a second host untouched after measuring it as already healthy, rather than changing things for consistency.',
    ],
    lessons:
      'Configuration that is valid is not configuration that works. When the same setting behaves differently on two hosts, the difference is in the path — measure from the vantage point that matters.',
  },

  {
    slug: 'torrent-pipeline',
    title: 'A torrent pipeline that survives VPN reconnects',
    summary:
      'Seeding requires an inbound port, and the VPN rotates that port on every reconnect. Keeping the client, the port mapping and the tracker status in agreement needed automation rather than discipline.',
    metric: 'Port re-synchronised automatically on every reconnect',
    stack: ['ProtonVPN', 'Transmission', 'RPC automation', 'Python', 'Scheduled tasks'],
    role: 'Sole engineer',
    context:
      'Torrent traffic needs a reachable inbound port to maintain ratio on private trackers. The VPN client assigns a forwarded port that changes on reconnect, while the torrent client holds a static configuration.',
    constraints: [
      'The torrent client must stay inside the VPN tunnel — split tunnelling it would leak the real address.',
      'Manual port updates fail silently after a reconnect, producing gradual ratio decay rather than an obvious error.',
      'The client has to run outside the agent session so it survives logoff.',
    ],
    decisions: [
      {
        title: 'Read the assigned port from the VPN client, not from configuration',
        body:
          'The authoritative port is recorded by the VPN client at connect time. A watcher polls that source and pushes changes to the torrent client over its RPC interface.',
      },
      {
        title: 'Verify reachability, not just agreement',
        body:
          'Setting the same port in both places does not prove the mapping works. A port test distinguishes "the client believes it is reachable" from "the tracker agrees", which are different failure modes.',
      },
      {
        title: 'Separate seeding payload from library presentation',
        body:
          'Seed data and library files share a single copy where possible, with hardlinks for presentation. Verification predicates on content, so a re-download to "fix" a path would destroy ratio for no benefit.',
      },
    ],
    outcome: [
      'Port synchronisation runs on a one-minute timer and survives reconnects without intervention.',
      'Tracker-reported connectivity restored after each reconnect instead of decaying overnight.',
      'Established a rule that no file operation touches torrent payload without a client stop and an integrity snapshot first.',
    ],
    lessons:
      'Any value that changes on its own schedule needs a reconciler, not a documented procedure. Documentation decays; a timer does not.',
  },

  {
    slug: 'media-stack',
    title: 'Self-hosted media and photo stack on commodity hardware',
    summary:
      'Photos, music broadcasting, remote desktop and dashboards, all served from a home rack with no cloud dependency — including the edge, the identity and the monitoring.',
    metric: '20+ services · single-command recovery · zero monthly cloud spend',
    stack: ['Proxmox', 'Docker', 'CIFS', 'Traefik', 'Cloudflare', 'Netdata', 'Uptime Kuma'],
    role: 'Sole engineer',
    context:
      'The goal was to replace paid cloud services with a self-hosted equivalent across photos, media, streaming, remote access and monitoring, while keeping the whole estate recoverable by one person.',
    constraints: [
      'Commodity hardware with a single hypervisor — no redundancy at the physical layer.',
      'Storage shared to containers over the network, so mount ordering affects service startup.',
      'Public access needed without exposing the home IP.',
    ],
    decisions: [
      {
        title: 'Push the edge to the provider, keep the data local',
        body:
          'All public hostnames terminate at a hosted tunnel, so no inbound ports are open and the home address is never published. The origin remains entirely local.',
      },
      {
        title: 'Make startup ordering explicit',
        body:
          'Remote storage mounts must exist before dependent containers start. Discovering this through failed restarts produced a documented dependency order rather than a hopeful `docker start -a`.',
      },
      {
        title: 'Monitor the whole path, not just the process',
        body:
          'A container can be running and still be unusable. Health checks are modelled on the user-visible path so a green process does not mask a broken service.',
      },
    ],
    outcome: [
      'Photos, broadcast audio, remote desktop, dashboards and monitoring all served from one host.',
      'No inbound firewall ports; every published service reachable through the tunnel only.',
      'Full recovery demonstrated after hardware failure, including database repair and re-mounting remote storage.',
    ],
    lessons:
      'Self-hosting is an operations discipline, not a hosting choice. The value is in the recovery path, not the uptime chart.',
  },
  {
    slug: 'gated-delivery',
    title: 'Delivering a private file through a public page, without storing it',
    summary:
      'A credential bundle needed to be downloadable by exactly one person from a dashboard that is deliberately public. The obvious gate — protect the tile — was the wrong one, because a control that only appears after a successful request vanishes precisely when that request fails.',
    metric: 'File never leaves the origin · anonymous redirect, authorised download · 12 client-side assertions',
    stack: ['Cloudflare Access', 'Workers', 'JWT / JWKS verification', 'Node.js', 'jsdom'],
    role: 'Sole engineer',
    context:
      'A self-hosted dashboard is public on purpose: it is a landing page, not a secret. One tile among many needed to hand a credential bundle to its owner alone. The bundle had to stay on the local origin, and the estate publishes nothing directly — every public hostname terminates at a hosted edge.',
    constraints: [
      'The dashboard had to stay public. Protecting the whole hostname would have closed a door that was intentionally open.',
      'A protected subresource cannot prompt for authentication: an asynchronous request carries no navigation, so a session can never be established through it.',
      'The tile had to remain visible even when the identity check fails — which is the one case where it is most likely to fail.',
      'An earlier version cached the file at the edge for convenience, which put the data somewhere other than the origin that owns it.',
    ],
    decisions: [
      {
        title: 'Gate the click, not the page',
        body:
          'Rendering the control unconditionally and gating the navigation inverted the failure mode. If the identity check fails, the tile is still there and the click resolves it. If it succeeded first, a broken request would have removed the only thing the user needed.',
      },
      {
        title: 'Keep identity at the edge and data on the origin',
        body:
          'The access policy and the session live at the provider; the file is served by a small process bound to the local network that answers one route and nothing else. The provider authenticates, the origin authorises, and neither holds the other piece.',
      },
      {
        title: 'Verify the assertion instead of trusting the header',
        body:
          'The edge injects a signed assertion on an authorised request, but a header is still a string. The verifying function re-derives trust: it fetches the published signing keys, checks the signature, checks the audience claim and checks expiry. A token minted for a different application on the same account is rejected rather than honoured.',
      },
      {
        title: 'Test the client without a browser',
        body:
          'The failure being fixed was invisible from the server side: a healthy container, a 200 response, a missing control. A DOM harness runs the deployed script against the deployed markup and asserts the control exists, is first in its list, has handlers, carries the correct icon, and does not duplicate when run twice.',
      },
    ],
    outcome: [
      'Anonymous requests redirected to the identity provider; authorised requests returned the file byte-identical to the origin copy, with no edge-side copy retained.',
      'Malformed, expired, tampered and wrong-audience tokens each rejected in isolation rather than as a group.',
      'The dashboard remained public and unauthenticated throughout, and the tile now renders before any network call is attempted.',
    ],
    lessons:
      'A control that only appears after a successful request is absent exactly when that request fails. Render the affordance first and let the click do the work.',
  },

  {
    slug: 'reproducible-estate',
    title: 'An estate that runs but cannot be rebuilt',
    summary:
      'Containers were declarative and survived anything. Everything else — edge applications, routes, policies, DNS and one database fix — existed only as the side effect of an API call or a manual edit. Nothing could be reconstructed, only remembered.',
    metric: '26 files versioned · 10 edge objects exported · nightly reconciliation, verified',
    stack: ['Git', 'Infrastructure as code', 'Cloudflare API', 'PowerShell', 'Docker Compose'],
    role: 'Sole engineer',
    context:
      'The estate was stable: containers rebuilt cleanly, upgrades were uneventful, and reboots changed nothing. That stability was masking a different problem. Only one layer was described by a file, and the rest of the configuration had no representation anywhere except the running system.',
    constraints: [
      'The estate was in daily use, so a reproducibility exercise could not become an outage.',
      'Configuration and secrets were entangled: container definitions carried database passwords in plain environment blocks.',
      'There was no version history for any of it, and therefore no baseline to diff against.',
    ],
    decisions: [
      {
        title: 'Separate rebuilt from recoverable',
        body:
          'Docker Compose is genuinely declarative: the file states the desired end state and a command converges on it, which is why containers survived upgrades. The edge was imperative: objects were created once and thereafter merely existed. A snapshot of those objects is recoverable but not reproducible, and presenting it as infrastructure as code would have been dishonest.',
      },
      {
        title: 'Version what is safe, export what is not',
        body:
          'A first attempt to version a working scripts directory staged hundreds of files including credential material. That was rejected rather than reasoned with. The scope was narrowed to the artefacts that matter, and both commits were gated on a scan that fails if any known secret value appears anywhere in the staged tree.',
      },
      {
        title: 'Automate the refresh, then prove the automation',
        body:
          'A scheduled job pulls the live configuration, re-exports the edge state and commits only when something changed. The task was triggered immediately, its exit code checked and the resulting commit confirmed — because a scheduler reporting success and a job that actually ran are different claims.',
      },
      {
        title: 'Send the state somewhere it can survive',
        body:
          'Definitions that cannot be versioned safely were archived to a separate device with retention, and the named volumes were classified as data rather than configuration — which changes what protects them.',
      },
    ],
    outcome: [
      'Twenty-six files under version control, including the edge export of applications, policies, routes, tunnel ingress, DNS and rulesets.',
      'A nightly task with a secret-scanning commit gate, verified end to end rather than assumed.',
      'The remaining gaps documented inside the repository itself: a hand-created database table, a repository that is still single-copy, and the absence of a scheduled hypervisor backup.',
    ],
    lessons:
      'If a fix exists only inside a running system, it is a rumour. Documentation is proven by whether it can rebuild the thing, not by whether it describes it.',
  },

  {
    slug: 'silent-failure',
    title: 'Three services that reported success while broken',
    summary:
      'A reverse proxy emitted roughly ten thousand errors a day, a dashboard returned HTTP 200 with nothing on it, and a mail queue held thousands of messages. Each system was healthy by its own measure. None of them was usable.',
    metric: '~10,000 errors/day to zero · empty page to fully populated · queue cause found',
    stack: ['Traefik', 'Docker', 'SQLite', 'Postfix', 'Log analysis'],
    role: 'Sole engineer',
    context:
      'Three unrelated services on one estate were failing in ways their own reporting described as success. The proxy was serving traffic correctly while filling its log with failures. The dashboard was returning a valid empty page rather than an error. The mail server was accepting messages and never delivering them.',
    constraints: [
      'Every service passed the check that was already watching it, so the monitoring could not be the source of the diagnosis.',
      'Each fault sat in a different layer from the symptom, which is what made them persist.',
      'Restarting the affected services cleared nothing, so the fixes had to be understood before they were applied.',
    ],
    decisions: [
      {
        title: 'Measure the path, not the process',
        body:
          'A running container and a 200 response were both true and both useless. Health was redefined against the user-visible path — does the page contain what it should, does the mail leave the queue, is the error rate falling — so a green indicator could no longer mask a broken service.',
      },
      {
        title: 'Treat "the migrations ran" as a claim, not evidence',
        body:
          'The dashboard rendered nothing because a table the interface filters on did not exist, while the migration log reported that its migration had run. Verifying the schema directly, rather than the bookkeeping about the schema, found it in minutes. The same instinct applied to a repair tool whose output passed an integrity check while having destroyed two columns.',
      },
      {
        title: 'Fix the layer the fault is in, not the layer the symptom is in',
        body:
          'The mail failure looked like DNS and was — but not in the file being edited. A chrooted daemon reads its own copy of the resolver configuration, which still pointed at an address that no longer existed. Editing the system copy had no effect, which read as a failed fix rather than a misplaced one.',
      },
      {
        title: 'Change the version, not the workaround',
        body:
          'The proxy was negotiating an API version its daemon no longer accepted. Pinning the version with an unsupported flag killed the container outright; the correct answer was upgrading to a release that negotiates natively, after which the errors stopped without further configuration.',
      },
    ],
    outcome: [
      'Proxy error volume fell from roughly ten thousand a day to zero, measured over a soak period rather than a single moment.',
      'The dashboard returned every pinned item instead of an empty page, and the missing table was recorded so a restored database does not repeat the fault.',
      'The mail queue drained — and the reason delivery was impossible in the first place, a blocklisted public address, was identified before further effort went into a fix that could never have worked.',
    ],
    lessons:
      'A green check proves that the check ran, not that the thing works. Instrument the path the user takes, and always verify the layer beneath the one reporting success.',
  },
];

export const bySlug = Object.fromEntries(caseStudies.map((c) => [c.slug, c]));
