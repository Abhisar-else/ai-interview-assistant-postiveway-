-- Apply once to PostgreSQL databases created before session_id became unique.
-- The ALTER TABLE command intentionally fails if duplicate reports exist so
-- no report data is discarded without an explicit cleanup decision.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uq_interview_reports_session_id'
          AND conrelid = 'interview_reports'::regclass
    ) THEN
        ALTER TABLE interview_reports
            ADD CONSTRAINT uq_interview_reports_session_id UNIQUE (session_id);
    END IF;
END $$;
