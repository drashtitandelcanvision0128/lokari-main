import { Prisma } from '@prisma/client';

const CASE_INSENSITIVE_COLUMNS = new Set(['name', 'email']);

export async function findManyWithSort({
  prismaClient,
  modelDelegate,
  tableName,
  idColumn,
  whereClauseSql,
  where,
  skip,
  limit,
  dbField,
  sortOrder,
  caseInsensitive = false,
}) {
  if (!caseInsensitive || !CASE_INSENSITIVE_COLUMNS.has(dbField)) {
    return modelDelegate.findMany({
      where,
      orderBy: { [dbField]: sortOrder },
      skip,
      take: limit,
    });
  }

  const direction = sortOrder === 'desc' ? Prisma.sql`DESC` : Prisma.sql`ASC`;
  const column = Prisma.raw(`"${dbField}"`);

  const rows = await prismaClient.$queryRaw`
    SELECT ${Prisma.raw(`"${idColumn}"`)} AS id
    FROM ${Prisma.raw(`"${tableName}"`)}
    WHERE ${whereClauseSql}
    ORDER BY LOWER(${column}) ${direction}, ${column} ${direction}
    LIMIT ${limit} OFFSET ${skip}
  `;

  const ids = rows.map((row) => row.id);
  if (ids.length === 0) {
    return [];
  }

  const records = await modelDelegate.findMany({
    where: { [idColumn]: { in: ids } },
  });

  const recordsById = new Map(records.map((record) => [record[idColumn], record]));
  return ids.map((id) => recordsById.get(id)).filter(Boolean);
}
