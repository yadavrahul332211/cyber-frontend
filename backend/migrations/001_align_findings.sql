BEGIN;

-- Preserve the existing findings table
ALTER TABLE findings RENAME TO findings_legacy;

-- Create the documented CYBER findings table
CREATE TABLE findings (
    id SERIAL PRIMARY KEY,

    asset VARCHAR(255) NOT NULL,

    type VARCHAR(20) NOT NULL,

    source VARCHAR(20) NOT NULL,

    title VARCHAR(255) NOT NULL,

    severity VARCHAR(20) NOT NULL,

    evidence TEXT NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'open',

    CONSTRAINT findings_type_check
        CHECK (type IN (
            'web',
            'server',
            'network',
            'host',
            'other'
        )),

    CONSTRAINT findings_source_check
        CHECK (source IN (
            'nmap',
            'nuclei'
        )),

    CONSTRAINT findings_severity_check
        CHECK (severity IN (
            'info',
            'low',
            'medium',
            'high',
            'critical'
        )),

    CONSTRAINT findings_status_check
        CHECK (status IN (
            'open',
            'resolved',
            'ignored'
        ))
);

-- Index for finding ID

-- Migrate valid historical Nmap/Nuclei records
INSERT INTO findings (
    id,
    asset,
    type,
    source,
    title,
    severity,
    evidence,
    status
)
SELECT
    f.id,

    COALESCE(
        NULLIF(f.host, ''),
        a.name
    ) AS asset,

    CASE
        WHEN LOWER(f.scanner) = 'nuclei'
            THEN 'web'
        WHEN LOWER(f.scanner) = 'nmap'
            THEN 'server'
    END AS type,

    LOWER(f.scanner) AS source,

    f.title,

    LOWER(f.severity) AS severity,

    CONCAT_WS(
        ', ',
        NULLIF(f.evidence, ''),
        CASE
            WHEN f.description IS NOT NULL
            THEN 'Description: ' || f.description
        END,
        CASE
            WHEN f.remediation IS NOT NULL
            THEN 'Remediation: ' || f.remediation
        END
    ) AS evidence,

    'open' AS status

FROM findings_legacy f
JOIN assets a
    ON a.id = f.asset_id

WHERE LOWER(f.scanner) IN ('nmap', 'nuclei')
  AND LOWER(f.severity) IN (
      'info',
      'low',
      'medium',
      'high',
      'critical'
  );

-- Continue ID sequence after migrated records
SELECT setval(
    pg_get_serial_sequence('findings', 'id'),
    COALESCE(
        (SELECT MAX(id) FROM findings),
        1
    ),
    true
);

COMMIT;
