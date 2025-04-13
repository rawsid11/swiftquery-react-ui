// src/mockSchemaData.js (Create this new file)

// Simple unique ID generator for mock data
let nodeId = 0;
const getId = () => `node-${nodeId++}`;

export const mockDatabaseSchema = {
  id: getId(),
  name: 'memory_db', // Or a file name
  type: 'database',
  children: [
    {
      id: getId(),
      name: 'main',
      type: 'schema',
      children: [
        {
          id: getId(),
          name: 'customers',
          type: 'table',
          children: [
            { id: getId(), name: 'customer_id', type: 'column', dataType: 'INTEGER' },
            { id: getId(), name: 'first_name', type: 'column', dataType: 'VARCHAR' },
            { id: getId(), name: 'last_name', type: 'column', dataType: 'VARCHAR' },
            { id: getId(), name: 'email', type: 'column', dataType: 'VARCHAR' },
            { id: getId(), name: 'registration_date', type: 'column', dataType: 'DATE' },
          ],
        },
        {
          id: getId(),
          name: 'orders',
          type: 'table',
          children: [
            { id: getId(), name: 'order_id', type: 'column', dataType: 'INTEGER' },
            { id: getId(), name: 'customer_id', type: 'column', dataType: 'INTEGER' },
            { id: getId(), name: 'order_date', type: 'column', dataType: 'TIMESTAMP' },
            { id: getId(), name: 'total_amount', type: 'column', dataType: 'DECIMAL(10, 2)' },
          ],
        },
        {
          id: getId(),
          name: 'active_customers_view',
          type: 'view',
          children: [
            { id: getId(), name: 'customer_id', type: 'column', dataType: 'INTEGER' },
            { id: getId(), name: 'full_name', type: 'column', dataType: 'VARCHAR' },
            { id: getId(), name: 'email', type: 'column', dataType: 'VARCHAR' },
          ],
        },
      ],
    },
    {
      id: getId(),
      name: 'sales_reporting',
      type: 'schema',
      children: [
         {
          id: getId(),
          name: 'quarterly_sales',
          type: 'table',
          children: [
             { id: getId(), name: 'report_id', type: 'column', dataType: 'UUID' },
             { id: getId(), name: 'quarter', type: 'column', dataType: 'VARCHAR' },
             { id: getId(), name: 'revenue', type: 'column', dataType: 'DOUBLE' },
          ],
        },
      ]
    },
    {
        id: getId(),
        name: 'empty_schema',
        type: 'schema',
        children: [], // Example of an empty schema
    }
  ],
};
