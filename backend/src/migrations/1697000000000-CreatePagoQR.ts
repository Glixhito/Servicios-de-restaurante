import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreatePagoQR1697000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Tabla pago_qr
    await queryRunner.createTable(
      new Table({
        name: 'pago_qr',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          { name: 'restaurante_id', type: 'uuid', isNullable: false },
          { name: 'pedido_id', type: 'uuid', isNullable: false },
          { name: 'tipo_pago', type: 'varchar' }, // Guardaremos el Enum como string
          { name: 'estado', type: 'varchar', default: "'ESPERANDO_PAGO'" },
          { name: 'monto', type: 'numeric', precision: 10, scale: 2 },
          { name: 'referencia', type: 'varchar', length: '100', isUnique: true },
          { name: 'qr_data', type: 'text' },
          { name: 'url_qr', type: 'varchar', isNullable: true },
          { name: 'codigo_nequi', type: 'varchar', isNullable: true },
          { name: 'id_transaccion_nequi', type: 'varchar', isNullable: true },
          { name: 'timestamp_creacion', type: 'timestamp', isNullable: true },
          { name: 'timestamp_pago', type: 'timestamp', isNullable: true },
          { name: 'timestamp_confirmacion', type: 'timestamp', isNullable: true },
          { name: 'intentos', type: 'int', default: 0 },
          { name: 'historico_intentos', type: 'text', isNullable: true },
          { name: 'error_message', type: 'text', isNullable: true },
          { name: 'ip_cliente', type: 'varchar', isNullable: true },
          { name: 'user_agent', type: 'varchar', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
    );

    // 2. Tabla auditoria_pago
    await queryRunner.createTable(
      new Table({
        name: 'auditoria_pago',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          { name: 'restaurante_id', type: 'uuid', isNullable: false },
          { name: 'pago_qr_id', type: 'uuid', isNullable: false },
          { name: 'accion', type: 'varchar' },
          { name: 'monto', type: 'numeric', precision: 10, scale: 2, isNullable: true },
          { name: 'referencia', type: 'varchar', isNullable: true },
          { name: 'detalles', type: 'text', isNullable: true },
          { name: 'ip', type: 'varchar', isNullable: true },
          { name: 'user_agent', type: 'varchar', isNullable: true },
          { name: 'exitoso', type: 'boolean', default: false },
          { name: 'timestamp', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
    );

    // 3. Llaves Foráneas (Foreign keys)
    await queryRunner.createForeignKey(
      'pago_qr',
      new TableForeignKey({
        columnNames: ['restaurante_id'],
        referencedTableName: 'restaurante',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'pago_qr',
      new TableForeignKey({
        columnNames: ['pedido_id'],
        referencedTableName: 'pedido',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'auditoria_pago',
      new TableForeignKey({
        columnNames: ['restaurante_id'],
        referencedTableName: 'restaurante',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'auditoria_pago',
      new TableForeignKey({
        columnNames: ['pago_qr_id'],
        referencedTableName: 'pago_qr',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // 4. Índices para mejorar la velocidad de búsqueda
    await queryRunner.createIndex('pago_qr', new TableIndex({ columnNames: ['referencia'], isUnique: true }));
    await queryRunner.createIndex('pago_qr', new TableIndex({ columnNames: ['restaurante_id'] }));
    await queryRunner.createIndex('pago_qr', new TableIndex({ columnNames: ['estado'] }));
    await queryRunner.createIndex('pago_qr', new TableIndex({ columnNames: ['timestamp_creacion'] }));
    await queryRunner.createIndex('auditoria_pago', new TableIndex({ columnNames: ['restaurante_id'] }));
    await queryRunner.createIndex('auditoria_pago', new TableIndex({ columnNames: ['timestamp'] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Si necesitas revertir la migración, borra las tablas en orden inverso
    await queryRunner.dropTable('auditoria_pago', true, true, true);
    await queryRunner.dropTable('pago_qr', true, true, true);
  }
}