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
    provenance: 'ai-assisted',
    keywords: ['DNS', 'tunnel ingress', 'subnet migration', 'incident response'],
    title: 'Moving 20 public services across a subnet renumber',
    summary:
      'A subnet renumber left every published hostname unreachable at once. DNS looked correct the whole time, so finding the fault meant working out which layer was actually dead.',
    metric: '23 ingress rules repointed · estate fully verified after origin fixes',
    stack: ['DNS', 'Edge proxy', 'Tunnel ingress', 'Linux'],
    role: 'Sole engineer',
    context:
      'A homelab of about twenty self-hosted applications moved onto a different private subnet. Each public hostname is published through a tunnel, so the DNS records stayed valid, and that is exactly what made the outage confusing.',
    constraints: [
      'No maintenance window, because the services were in daily use.',
      'The ingress rules are held by the edge provider, so the local copy on the connector was stale and nobody was reading it.',
      'One bad update replaces every route at once, for all hostnames together.',
    ],
    decisions: [
      {
        title: 'Check the origin addresses, not the records',
        body:
          'The DNS audit came back clean and was a false negative. Every ingress rule still carried a hardcoded origin address from the old subnet.',
      },
      {
        title: 'Save a copy before changing anything',
        body:
          'The full rule list was exported first. A single bad edit can drop every hostname, and the API will not say which rule was wrong.',
      },
      {
        title: 'Reconcile in both directions',
        body:
          'Rules pointing at dead services and records with no matching rule both show up as the same catch-all 404. Each direction was listed separately until every hostname was accounted for.',
      },
    ],
    outcome: [
      'Ingress went from 24 rules to 23, with every origin repointed to the new subnet.',
      '20 of 22 hostnames worked on the first pass. The other two had origin failures rather than routing failures, which showed the edge itself was correct.',
      'Both origins were repaired afterwards, taking the estate to fully verified.',
      'A 502 now means routing is fine and the origin is down, while a 404 means no rule matched. That distinction makes later faults quick to place.',
    ],
    lessons:
      'A clean DNS audit only proves the records are right, not that traffic can reach anything. When one layer reports success, probe the layer beneath it directly instead of trusting a status code.',
  },

  {
    slug: 'database-recovery',
    provenance: 'ai-assisted',
    keywords: ['SQLite', 'data recovery', 'backup validation', 'integrity checking'],
    title: 'Recovering a corrupt database, and knowing when not to',
    summary:
      'A media manager began returning 500s. The database was corrupt, the newest backups were corrupt too, and the usual repair tool produced a file that passed its checks while quietly destroying data.',
    metric: 'Recovered to integrity-ok with zero row loss',
    stack: ['SQLite', 'Python', 'Backups', 'Integrity checks'],
    role: 'Sole engineer',
    context:
      'An application returned HTTP 500 on its main listing page. The SQLite database underneath had truncated overflow chains in one table, and four backups existed covering three weeks.',
    constraints: [
      'The service was in daily use and needed to come back up.',
      'Restoring a three-week-old backup would throw away recent changes.',
      'The obvious repair tool is not data-preserving, and it does not say so.',
    ],
    decisions: [
      {
        title: 'Test every backup before choosing one',
        body:
          'All four backups were integrity-checked instead of assuming the newest was good. Two of them were corrupt as well, because the damage predated the last snapshots, so restoring last night would have restored the fault.',
      },
      {
        title: 'Treat the repair output as suspect until it is diffed',
        body:
          'The repaired file passed integrity checks and had matching row counts. A column-level comparison showed two JSON columns emptied and a path column gone in the corrupted cells, so passing the check had not meant the data was correct.',
      },
      {
        title: 'Restore the older clean copy, once it was proved complete',
        body:
          'The older backup and the live database matched on row counts and paths for every table that mattered. The older copy was not stale, it was simply the last clean one.',
      },
    ],
    outcome: [
      'Service restored, integrity check clean, listing endpoint returning 200.',
      'All three database versions compared for identical item and file counts, so the restore introduced no regression.',
      'Two of the four backups recorded as never restorable, so a future reader does not repeat the mistake.',
    ],
    lessons:
      'A clean integrity check proves the structure holds, not that the data survived. A backup you have never opened and checked is a guess, not a backup.',
  },

  {
    slug: 'dns-latency',
    provenance: 'ai-assisted',
    keywords: ['DNS', 'VPN routing', 'latency', 'packet probing'],
    title: '400ms to 30ms: diagnosing DNS that looked correct',
    summary:
      'Name resolution was slow and some names failed outright. The configured resolvers were valid and answered from other machines, and were still useless here, because a VPN was carrying the traffic.',
    metric: '~13x reduction in lookup latency · failure eliminated',
    stack: ['DNS', 'VPN routing', 'Windows networking', 'Packet probing'],
    role: 'Sole engineer',
    context:
      'Lookups took roughly 400ms each and one hostname would not resolve at all. The adapter used the ISP resolvers, which answer normally from other machines on the same network.',
    constraints: [
      'The same resolver addresses worked from a second host on the same LAN, so "the DNS server is down" was already ruled out.',
      'Changing DNS part way through risks cutting the machine off entirely.',
    ],
    decisions: [
      {
        title: 'Test from both ends before drawing a conclusion',
        body:
          'Raw queries from the affected machine timed out on both UDP and TCP, while identical queries from the hypervisor returned NOERROR. The resolver was fine, the path to it was not.',
      },
      {
        title: 'Follow the route, not the config',
        body:
          'A route lookup showed traffic to those resolvers being sent into the VPN tunnel and dropped there. The configured DNS was dead whenever the VPN was up, and the machine fell back to the tunnel resolver after paying a timeout.',
      },
      {
        title: 'Measure the fix rather than assert it',
        body:
          'After repointing to resolvers reachable in both states, latency was measured inside a single process to keep shell startup out of the number. Otherwise a 30ms improvement reads as a 400ms non-event.',
      },
    ],
    outcome: [
      'Lookup latency fell from about 400ms to about 30ms, measured warm and cold.',
      'The one hostname that still failed turned out not to exist, so the test name was wrong rather than the resolver.',
      'A second host was left untouched once it measured healthy, instead of being changed for consistency.',
    ],
    lessons:
      'A setting that is valid is not a setting that works. When the same configuration behaves differently on two machines the difference is in the path, so measure from the machine that is actually failing.',
  },

  {
    slug: 'torrent-pipeline',
    provenance: 'ai-assisted',
    keywords: ['automation', 'VPN port forwarding', 'reliability', 'reconciliation'],
    title: 'A torrent pipeline that survives VPN reconnects',
    summary:
      'Seeding needs an inbound port, and the VPN hands out a new one on every reconnect. Keeping the client, the port mapping and the tracker in agreement turned out to be a job for a timer, not a checklist.',
    metric: 'Port re-synchronised automatically on every reconnect',
    stack: ['VPN port forwarding', 'Torrent client', 'RPC automation', 'Scheduled tasks'],
    role: 'Sole engineer',
    context:
      'Torrent traffic needs a reachable inbound port to hold ratio on private trackers. The VPN assigns a forwarded port that changes each time it reconnects, while the torrent client keeps a static setting.',
    constraints: [
      'The torrent client must stay inside the tunnel, because split tunnelling would leak the real address.',
      'A missed manual update fails silently and shows up as slow ratio decay instead of an error.',
      'The watcher has to run outside the login session so it survives logoff.',
    ],
    decisions: [
      {
        title: 'Read the port from the VPN, not from config',
        body:
          'The VPN records the assigned port when it connects. A watcher polls that source and pushes any change into the torrent client over its RPC interface.',
      },
      {
        title: 'Check reachability, not agreement',
        body:
          'The same number in both places does not prove the mapping works. A port test separates "the client thinks it is open" from "the tracker agrees", and those two fail differently.',
      },
      {
        title: 'Keep a single copy of the files',
        body:
          'Seed data and library files share one copy where possible, joined with hardlinks for presentation. Because checks look at content, a re-download to fix a path would only burn ratio.',
      },
    ],
    outcome: [
      'Port synchronisation runs on a one-minute timer and rides out reconnects with no intervention.',
      'Tracker-reported connectivity comes back after each reconnect instead of decaying overnight.',
      'No file operation touches torrent payload without stopping the client and taking an integrity snapshot first.',
    ],
    lessons:
      'Any value that changes on its own schedule needs a reconciler rather than a written procedure. People miss the step, and the failure arrives as slow decay with nothing to alert you.',
  },

  {
    slug: 'media-stack',
    provenance: 'ai-assisted',
    keywords: ['self-hosting', 'virtualisation', 'storage', 'monitoring'],
    title: 'Self-hosted media and photo stack on commodity hardware',
    summary:
      'Photos, music broadcasting, remote desktop and dashboards, all served from a home rack with no monthly cloud bill, along with the edge, the identity and the monitoring.',
    metric: '28 containers · single-command recovery · zero monthly cloud spend',
    stack: ['Virtualisation', 'Containers', 'Storage share', 'Monitoring'],
    role: 'Sole engineer',
    context:
      'The goal was to replace paid cloud services with a self-hosted equivalent across photos, media, streaming, remote access and monitoring. The whole estate also had to stay recoverable by one person, on commodity hardware running a single hypervisor.',
    constraints: [
      'One machine behind a single hypervisor, so there is no redundancy at the physical layer.',
      'Storage is shared to the containers over the network, so mount order decides which services start.',
      'Public access was needed without exposing the home address.',
    ],
    decisions: [
      {
        title: 'Put the edge at the provider, keep the data local',
        body:
          'Every public hostname terminates at a hosted tunnel, so no inbound ports are open and the home address is never published. The services themselves stay on the local host and answer only through that tunnel.',
      },
      {
        title: 'Make startup order explicit',
        body:
          'Remote storage mounts have to exist before the containers that use them. A few failed restarts turned that into a written dependency order instead of hoping the timing works out.',
      },
      {
        title: 'Watch the path, not the process',
        body:
          'A container can be running and still be useless to anyone trying to use it. Health checks are written against what a user actually sees, so a green process cannot hide a broken service.',
      },
    ],
    outcome: [
      'Photos, broadcast audio, remote desktop, dashboards and monitoring all served from one host.',
      'No inbound firewall ports, with every published service reachable through the tunnel only.',
      '28 containers brought back from a single command.',
      'Full recovery proven after a hardware failure, including database repair and remounting remote storage.',
    ],
    lessons:
      'Self-hosting is an operations job, not a hosting choice. What you own is the recovery path you can walk when the hardware is down, and the uptime chart only describes what already happened.',
  },
  {
    slug: 'gated-delivery',
    provenance: 'ai-assisted',
    keywords: ['identity', 'access control', 'token verification', 'client testing'],
    title: 'Delivering a private file through a public page',
    summary:
      'One tile on a public dashboard had to hand a credential bundle to a single person. Protecting the tile looked obvious and was wrong, because a control that appears only after a successful request disappears exactly when that request fails.',
    metric: 'File never leaves the origin · anonymous redirect, authorised download · 12 client-side assertions',
    stack: ['Cloudflare Access', 'Workers', 'JWT verification', 'Node.js'],
    role: 'Sole engineer',
    context:
      'A self-hosted dashboard is public on purpose: it is a landing page, not a secret. One tile among many needed to give a credential bundle to its owner alone, and the bundle had to stay on the local origin.',
    constraints: [
      'The dashboard had to stay public, so protecting the whole hostname was not an option.',
      'A protected subresource cannot prompt for login, because an asynchronous request carries no navigation and no session can start through it.',
      'The tile had to stay visible when the identity check fails, which is the case where it matters most.',
      'An earlier version cached the file at the edge, putting the data somewhere other than the origin that owns it.',
    ],
    decisions: [
      {
        title: 'Gate the click, not the page',
        body:
          'The control is rendered every time and the navigation is what gets checked. If the identity check fails, the tile is still there and the click resolves it.',
      },
      {
        title: 'Keep identity at the edge, data on the origin',
        body:
          'The provider handles login and holds the session. A small local process serves one route and nothing else, so neither side holds the other half.',
      },
      {
        title: 'Verify the assertion instead of trusting the header',
        body:
          'A signed header is still just a string. The handler fetches the published signing keys and checks the signature, the audience and the expiry, so a token minted for another application is rejected.',
      },
      {
        title: 'Test the client without a browser',
        body:
          'The fault was invisible from the server side: a healthy process, a 200 response, no control. A DOM harness runs the deployed script against the deployed markup and asserts the control exists, sits first in its list, has handlers, and does not duplicate on a second run.',
      },
    ],
    outcome: [
      'Anonymous requests were redirected; authorised requests returned the file byte-identical to the origin copy, with no copy kept at the edge.',
      'Malformed, expired, tampered and wrong-audience tokens were each rejected on their own.',
      'The dashboard stayed public and unauthenticated, and the tile now renders before any network call is attempted.',
    ],
    lessons:
      'A control that only appears after a successful request is missing exactly when that request fails. Render the affordance first and let the click do the work.',
  },

  {
    slug: 'reproducible-estate',
    provenance: 'ai-assisted',
    keywords: ['infrastructure as code', 'version control', 'secret hygiene', 'recovery'],
    title: 'An estate that runs but cannot be rebuilt',
    summary:
      'Containers were declarative and survived anything. Everything else, including edge applications, routes, policies, DNS and one database fix, existed only as the side effect of an API call or a manual edit. Nothing could be reconstructed, only remembered.',
    metric: '26 files versioned · 10 edge objects exported · nightly reconciliation, verified',
    stack: ['Git', 'Infrastructure as code', 'Cloudflare API', 'Docker Compose'],
    role: 'Sole engineer',
    context:
      'The estate was stable: containers rebuilt cleanly, upgrades were uneventful, reboots changed nothing. That stability hid the problem. Only one layer was described by a file, and the rest of the configuration existed nowhere except the running system.',
    constraints: [
      'The estate was in daily use, so a reproducibility exercise could not become an outage.',
      'Configuration and secrets were entangled, with database passwords sitting in plain environment blocks.',
      'Nothing had version history, so there was no baseline to diff against.',
    ],
    decisions: [
      {
        title: 'Separate rebuilt from recoverable',
        body:
          'Container definitions state a desired end state and a command converges on it, which is why they survived upgrades. The edge was imperative: objects were created once and then merely existed, so a snapshot of them is recoverable but not reproducible.',
      },
      {
        title: 'Version what is safe, export what is not',
        body:
          'A first attempt staged hundreds of files, including credential material, and was rejected instead of reasoned with. Scope was narrowed to the artefacts that matter, and both commits are gated on a scan that fails if a known secret appears in the staged tree.',
      },
      {
        title: 'Automate the refresh, then prove it ran',
        body:
          'A scheduled job pulls the live configuration, re-exports the edge state and commits only when something changed. The job was triggered at once and its exit code and resulting commit were checked, because a scheduler reporting success and a job that actually ran are different claims.',
      },
      {
        title: 'Send the state somewhere it can survive',
        body:
          'Definitions that cannot be versioned safely are archived to a separate device with retention. Named volumes were classified as data rather than configuration, which changes what protects them.',
      },
    ],
    outcome: [
      'Twenty-six files under version control, including the edge export of applications, policies, routes, tunnel ingress, DNS and rulesets.',
      'A nightly task with a secret-scanning commit gate, verified end to end rather than assumed.',
      'Remaining gaps written down inside the repository itself: a hand-created database table, a single-copy repository, no scheduled hypervisor backup.',
    ],
    lessons:
      'A fix that exists only inside a running system is a rumour. Documentation counts when it can rebuild the thing, not when it describes it.',
  },

  {
    slug: 'silent-failure',
    provenance: 'ai-assisted',
    keywords: ['observability', 'false success', 'log analysis', 'root cause'],
    title: 'Three services that reported success while broken',
    summary:
      'A reverse proxy emitted roughly ten thousand errors a day, a dashboard returned HTTP 200 with nothing on it, and a mail queue held thousands of messages. Each system was healthy by its own measure, and none of them was usable.',
    metric: '~10,000 errors/day to zero · empty page to fully populated · queue cause found',
    stack: ['Traefik', 'SQLite', 'Postfix', 'Log analysis'],
    role: 'Sole engineer',
    context:
      'Three unrelated services on one estate were failing in ways their own reporting described as success. The proxy served traffic correctly while filling its log with failures. The dashboard returned a valid empty page, and the mail server accepted messages it never delivered.',
    constraints: [
      'Every service passed the check already watching it, so that monitoring could not produce the diagnosis.',
      'Each fault sat in a different layer from its symptom, which is why they persisted.',
      'Restarting the affected services cleared nothing.',
    ],
    decisions: [
      {
        title: 'Measure the path, not the process',
        body:
          'A running container and a 200 response were both true and both useless. Health was redefined against the path a user takes: does the page hold what it should, does mail leave the queue, is the error rate falling.',
      },
      {
        title: 'Treat "the migrations ran" as a claim',
        body:
          'The dashboard rendered nothing because a table it filters on did not exist, while the migration log said the migration had run. Checking the schema itself rather than the bookkeeping about it found the fault in minutes.',
      },
      {
        title: 'Fix the layer the fault is in',
        body:
          'The mail failure looked like DNS, but the confined daemon reads its own copy of the resolver configuration, which still named an address that no longer existed. Editing the system copy had no effect and read as a failed fix rather than a misplaced one.',
      },
      {
        title: 'Change the version, not the workaround',
        body:
          'The proxy was negotiating an API version its daemon no longer accepted. Pinning it with an unsupported flag killed the container, so the answer was a release that negotiates natively, after which the errors stopped with no further configuration.',
      },
    ],
    outcome: [
      'Proxy errors fell from roughly ten thousand a day to zero, measured over a soak period rather than one moment.',
      'The dashboard returned every pinned item, and the missing table was recorded so a restored database does not repeat the fault.',
      'The mail queue drained, and the underlying reason, a blocklisted public address, was found before more effort went into a fix that could never work.',
    ],
    lessons:
      'A green check proves the check ran, not that the thing works. Watch the path a user takes, and verify the layer beneath the one reporting success.',
  },
  {
    slug: 'wrong-diagnosis',
    provenance: 'ai-assisted',
    keywords: ['debugging', 'Docker volumes', 'API contracts', 'retracting a diagnosis'],
    title: 'The image was fine: overturning a confident diagnosis',
    summary:
      'A service refused to start and the container image took the blame. The image was intact. The real cause only surfaced once the thing already condemned was inspected instead of trusted.',
    metric: 'Restored on a fresh volume · 28 containers visible · root cause: data directory, not image',
    stack: ['Container platform', 'Docker volumes', 'REST APIs', 'SQLite'],
    role: 'Sole engineer',
    context:
      'A container management interface stopped working after a storage change. It was the second failure of its kind, and the first explanation, that the released image was defective, had already been accepted and repeated. That explanation was wrong and was blocking the fix.',
    constraints: [
      'The platform was the easiest way to see the whole container estate, so losing it also removed the usual diagnostic tool.',
      'Replacing the data volume was the likely fix, and the administrator account lived in that volume, so it needed an archive and a way back.',
      'Account recreation needs a one-time token that appears only in the container log at first start.',
    ],
    decisions: [
      {
        title: 'Test the claim about the image',
        body:
          'The image was inspected directly. It held a working binary and password hashes in a modern, well-formed format, so a defective image would not produce a valid credential store, and the hypothesis fell in one command.',
      },
      {
        title: 'Treat the data directory as the suspect',
        body:
          'The remaining state lived in a named volume rather than in the image. Archiving that volume and rebuilding from the declaration file produced a working service at once, which is a data fault rather than a code fault.',
      },
      {
        title: 'Initialise through the supported path',
        body:
          'First start emits a setup token and the initialisation endpoint rejects any request without it. The documented flow was used instead of inserting rows by hand, so the database is one the application created itself.',
      },
      {
        title: 'Read the API contract before assuming it',
        body:
          'The endpoint that registers a container host accepts multipart form data. Sending JSON returned an error about a missing name, which reads as a schema problem rather than a content-type problem, and cost a round of debugging the wrong thing.',
      },
    ],
    outcome: [
      'Service restored on a freshly created volume, with the previous one archived to a tarball first.',
      'The administrator account was rebuilt through the supported endpoint, then the full container estate was enumerated to confirm visibility.',
      'The earlier conclusion was retracted in writing, so the next reader does not repeat the investigation.',
    ],
    lessons:
      'A plausible diagnosis is not a verified one. When a conclusion is blocking progress, test the conclusion itself, and the cheapest test is usually looking inside the thing you have already blamed.',
  },

  {
    slug: 'mail-queue',
    provenance: 'ai-assisted',
    keywords: ['SMTP', 'DNS', 'deliverability', 'root cause'],
    title: 'Mail queued for weeks, for two unrelated reasons',
    summary:
      'A mail server held thousands of deferred messages while name resolution tested perfectly from everywhere else. Fixing that exposed a second problem: the public address was blocklisted, so delivery could never have worked at all.',
    metric: '3,500+ queued messages resolved · confined resolver found · delivery proven impossible in principle',
    stack: ['Postfix', 'DNS', 'SMTP', 'Log analysis'],
    role: 'Sole engineer',
    context:
      'A host stopped delivering notification mail. Messages accumulated in the queue instead of failing, so the sending side believed everything was working. Standard resolution tests passed, which pointed the investigation away from DNS entirely.',
    constraints: [
      'The queue was being cleared periodically, which removed the evidence and the symptom at the same time.',
      'External resolution tested correctly from the hypervisor and from public resolvers, so "the DNS server is broken" was demonstrably false.',
      'Restarting the service changed nothing, so the fault sat somewhere a reload does not reach.',
    ],
    decisions: [
      {
        title: 'Reproduce the failure from the daemon, not the shell',
        body:
          'The daemon runs confined and reads its own copy of the resolver configuration, which still named a gateway that no longer existed after a network renumber. Every shell test was reading a different file, so the results disagreed with the daemon.',
      },
      {
        title: 'Clear the queue, then read what it was saying',
        body:
          'Purging hides the symptom, so the deferred messages were inspected instead. Once outbound connectivity worked, they carried the real remote response: a reputation rejection naming the public address of the connection.',
      },
      {
        title: 'Distinguish sending from delivering',
        body:
          'A message leaving the local queue looks like success in most dashboards. Only the remote server response separates the two, and this one was a permanent rejection for reputation rather than a transient failure worth retrying.',
      },
      {
        title: 'Stop work on a path that cannot succeed',
        body:
          'With the reason established, the requirement changed from a configuration fix to an authenticated relay. Tuning the local mail server further would have produced an empty queue and zero delivered messages.',
      },
    ],
    outcome: [
      'Deferred queue drained, with the resolver fault corrected at its source rather than worked around.',
      'Every future network renumber now requires the confined resolver copy to be resynchronised, so the fix that was invisible stays visible.',
      'Direct delivery established as impossible from that public address, which turned an open-ended bug into a decision about relaying.',
    ],
    lessons:
      'A confined process can read a different copy of the configuration than the one being edited. And queued is not sent: the only proof of delivery is what the remote server says.',
  },

  {
    slug: 'upload-ceiling',
    provenance: 'ai-assisted',
    keywords: ['reverse proxy', 'CORS', 'DNS', 'upload limits'],
    title: 'A 403 that blamed the proxy, and a 100 MB ceiling it did not cause',
    summary:
      'The upload page was broken in two unrelated ways: logins came back with a CORS error, and files over 100 MB would not go through. One problem sat at the edge, the other in the app.',
    metric: 'Login 403 → 200 · 120 MB uploaded in 5.4 s (the limit had been 100 MB) · other sites still blocked',
    stack: ['DNS', 'Reverse proxy', 'TLS', 'File server'],
    role: 'Sole engineer',
    context:
      'A private upload page sat behind a hosted edge that caps request bodies at 100 MB. Sending the login form also failed, returning "rejected by cors-check". Both were reported as the page being broken, so at first they were treated as one fault.',
    constraints: [
      'The upload limit is set by the edge, not the app, so nothing on our side could lift it.',
      'The app is plain HTTP and works out which origins are allowed from its own connection, so any proxy in front puts it out of step with the browser.',
      'The page has to stay reachable from outside the home network, on an address that changes.',
    ],
    decisions: [
      {
        title: 'Show they were two faults, not one',
        body:
          'The login failed on a tiny form post, long before any large body was involved, so size could not have caused it. Failing the smallest possible request first told us which layer owned which problem.',
      },
      {
        title: 'Take the page off the edge',
        body:
          'The record became DNS-only and the reverse proxy we already had became the front door. The certificate was issued over DNS because there is no inbound port 80 for the usual check.',
      },
      {
        title: 'Tell the app about the proxy',
        body:
          'Allowing the correct origin would only have hidden the error while the app went on treating the proxy as the visitor, which quietly turns off recent uploads and delete. Naming the proxy, the client IP header and the scheme fixed the cause instead.',
      },
      {
        title: 'Accept what we lose',
        body:
          'The login wall only exists on proxied hostnames, so leaving the edge took it away. That was decided rather than discovered afterwards: the page now relies on its own password, like everything else we publish from the LAN.',
      },
    ],
    outcome: [
      'Login returns 200 with a secure cookie, and the warning about the reverse proxy has gone from the page.',
      'A 120 MB file uploaded in 5.4 seconds and arrived intact, where the ceiling had been 100 MB.',
      'Another site posting to the page still gets 403, and a wrong password still fails.',
      'One routing rule out of 24 was removed and the other sites were checked afterwards: dashboard and photo library both fine.',
    ],
    lessons:
      'An error that names one layer is not proof the fault is there: the smallest failing request showed which layer actually owned each problem, and that was the difference between fixing it and hiding it. Two smaller traps are worth keeping. An app that decides what is allowed from its own connection has to be told about every proxy in front of it, and changing a record from CNAME to A quietly dropped it out of the DNS updater, which only updates A records.',
  },

  {
    slug: 'capacity-waiting',
    provenance: 'ai-assisted',
    keywords: ['Oracle Cloud', 'Always Free', 'automation', 'capacity'],
    title: 'Queueing for a free ARM server that gets grabbed in seconds',
    summary:
      'Oracle gives ARM servers away while capacity lasts, and it rarely does. So the request runs unattended, with enough written down to tell "still waiting" apart from "broken".',
    metric: 'A try every 4 minutes · 531 launch requests · still no capacity',
    stack: ['Oracle Cloud', 'Python', 'systemd'],
    role: 'Sole engineer',
    context:
      'The estate runs on hardware we own and free services only, with no paid VPS. The one piece still missing is a free ARM server. Every request comes back "Out of host capacity", and when one does free up it is normally taken within seconds.',
    constraints: [
      'There is no money for this, so waiting is the only option, and the only thing worth improving is how often and how reliably we ask.',
      'Launch requests are real API calls, so hammering them gains nothing and risks being throttled.',
      'It runs unattended alongside everything else, and "still waiting" looks exactly like "broken" unless something writes the progress down.',
    ],
    decisions: [
      {
        title: 'Read first, launch occasionally',
        body:
          'Most cycles only read the capacity report, and every fifth cycle sends a real request, because the report can be out of date in both directions.',
      },
      {
        title: 'Do not commit to one server size',
        body:
          'Capacity is reported per size, so each cycle tries a different one and takes whichever frees up first.',
      },
      {
        title: 'Write the progress to disk',
        body:
          'Counters and the last error go into a status file every cycle, so a restart loses nothing. Over the past week the attempt count went from 30 to 531, and that is only visible because it is persisted.',
      },
      {
        title: 'Do not die on a network blip',
        body:
          'A DNS failure was recorded as the last error and the loop carried on. Crashing would have stopped the only thing that was trying.',
      },
    ],
    outcome: [
      'Running and set to start at boot: one cycle every four minutes, 1 day 11 hours up on the current run.',
      '531 launch requests, every one answered "Out of host capacity". Still no server, and that is the honest status.',
      'One command now answers "is it working and how far along", instead of digging through logs that have rotated.',
    ],
    lessons:
      'When something you want is given away in seconds, the only way to get it is to be asking all the time. But an automated wait is only worth trusting if it writes down its progress and its failures, otherwise a week of trying and a dead process look identical from the outside.',
  },

  {
    slug: 'data-audit',
    provenance: 'ai-assisted',
    keywords: ['databases', 'backup', 'audit', 'recovery'],
    title: 'Nineteen databases, and the backup that had stopped',
    summary:
      'Nobody had written down how many databases the estate runs, or what would survive losing one. Counting them was easy. Working out what copies each one turned up two problems.',
    metric: '19 data stores · 2 backup gaps found · 0 records changed',
    stack: ['PostgreSQL', 'MariaDB', 'SQLite', 'Proxmox'],
    role: 'Sole engineer',
    diagram: 'data-layer',
    diagramLabel: 'The data layer, as found',
    context:
      'An inventory was taken of every database in the estate: four server databases and seven embedded ones inside the container host, a cache and a search index alongside them, and six more on the Windows machine that handles media and downloads. The second question, which nobody had asked, was what copies each one.',
    constraints: [
      'The stores are spread across two hosts and three database engines, so no single tool can list them all.',
      'Reading sizes and row counts out of a production database is safe. Writing to one is not, so the audit had to stay read-only.',
      'Two of the stores are big enough that rebuilding by hand would take days, and the small ones hold configuration that is awkward to recreate.',
      'Most belong to third-party applications with their own schema, so there is no migration script to read for a clue about what matters.',
    ],
    decisions: [
      {
        title: 'Count engines, then count files',
        body:
          'The server databases were asked for their own sizes. The embedded ones were found by walking the container data directories for database files. Either method on its own misses about half of what exists.',
      },
      {
        title: 'Follow the backup, not the inventory',
        body:
          'The useful question was not how many databases exist but what copies each one. That led to a single weekly snapshot covering everything inside the container host, and nothing at all covering the Windows host.',
      },
      {
        title: 'Put the gaps in the same picture as the healthy parts',
        body:
          'A separate list of problems is easy to ignore. Showing the unprotected stores in the same diagram as the protected ones makes the hole visible in a single glance, which is why the diagram above exists.',
      },
      {
        title: 'Measure first, fix afterwards',
        body:
          'Findings were written down before anything was changed, so the audit stayed a measurement instead of turning into a repair session with an unknown starting point.',
      },
    ],
    outcome: [
      'Nineteen stores found: thirteen in containers and six on Windows, across three database engines plus a cache and a search index.',
      'Sizes measured rather than guessed: monitoring history 223 MB, photo library 153 MB, and the monitoring dashboard own history file 219 MB.',
      'The weekly snapshot that protects every container database missed its scheduled night on 15 November. The run before that had been on 18 October, and neither failure announced itself.',
      'The six Windows databases had no backup job at all, which is the more serious of the two findings.',
      'The radio stack own internal database turned out to be empty, confirming its data had really moved into the shared server instead of sitting in two places.',
    ],
    lessons:
      'An inventory is not a backup plan. Knowing every database exists says nothing about what would survive losing one, and asking that question store by store found two problems that a green status page would never show. One of them had gone unnoticed for a month.',
  },
];

export const bySlug = Object.fromEntries(caseStudies.map((c) => [c.slug, c]));
