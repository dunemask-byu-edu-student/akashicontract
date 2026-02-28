-- CreateTable
CREATE TABLE "ScheduledTask" (
    "id" TEXT NOT NULL DEFAULT pfx_id('sch_tsk'::text),
    "queue" TEXT NOT NULL,
    "kind" TEXT,
    "data" JSONB NOT NULL,
    "jobId" TEXT,
    "appId" TEXT,
    "executeAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduledTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL DEFAULT pfx_id('obj_schem'::text),
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "attributes" JSONB NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledTask_id_key" ON "ScheduledTask"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_id_key" ON "Contract"("id");
