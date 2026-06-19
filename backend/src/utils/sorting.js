const DEFAULT_SORT_ORDER = 'desc';

export function parseSortQuery(
  query = {},
  {
    allowedFields = {},
    defaultField,
    defaultOrder = DEFAULT_SORT_ORDER,
    caseInsensitiveFields = [],
  } = {},
) {
  const fallbackField =
    defaultField && allowedFields[defaultField] ? defaultField : Object.keys(allowedFields)[0];

  const requestedField = query.sortBy?.trim();
  const sortBy = requestedField && allowedFields[requestedField] ? requestedField : fallbackField;

  const requestedOrder = query.sortOrder?.trim()?.toLowerCase();
  const sortOrder =
    requestedOrder === 'asc' || requestedOrder === 'desc' ? requestedOrder : defaultOrder;

  const dbField = allowedFields[sortBy];
  const caseInsensitive = caseInsensitiveFields.includes(sortBy);

  return {
    sortBy,
    sortOrder,
    dbField,
    caseInsensitive,
    orderBy: caseInsensitive ? undefined : { [dbField]: sortOrder },
  };
}
