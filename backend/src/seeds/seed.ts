import { AppDataSource } from '../config/database.config';
import { Restaurante } from '../modules/restaurante/entities/restaurante.entity';
import { Categoria } from '../modules/categoria/entities/categoria.entity';
import { Producto } from '../modules/producto/entities/producto.entity';
import { ZonaDomicilio } from '../modules/zona-domicilio/entities/zona-domicilio.entity';
import { Administrador } from '../modules/auth/entities/administrador.entity';
import { Cliente } from '../modules/cliente/entities/cliente.entity';
import * as bcrypt from 'bcryptjs';

async function seed() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  console.log('Iniciando seed de datos...');

  // 💡 ID Fijo que coincide exactamente con el que tienes en Docker
  const RESTAURANTE_FIXED_ID = '9c9a269e-b09a-4c34-ad76-af2fe86ca62c';

  let savedRestaurante = await AppDataSource.manager.findOne(Restaurante, {
    where: { id: RESTAURANTE_FIXED_ID },
  });

  if (!savedRestaurante) {
    const restaurante = new Restaurante();
    restaurante.id = RESTAURANTE_FIXED_ID;
    restaurante.nombre = 'mi restaurante.elencuentro';
    restaurante.descripcion = 'El mejor restaurante de la ciudad';
    restaurante.telefono = '3001234567';
    restaurante.whatsapp = '3001234567';
    restaurante.direccion = 'Calle 1 #1-1';
    restaurante.aceptando_pedidos = true;
    savedRestaurante = await AppDataSource.manager.save(restaurante);
    console.log('Restaurante creado con ID fijo:', savedRestaurante.id);
  } else {
    console.log('Restaurante encontrado y reutilizado:', savedRestaurante.id);
  }

  // Limpiar categorías, productos y zonas anteriores para evitar duplicados
  await AppDataSource.manager.delete(Producto, { restaurante_id: savedRestaurante.id });
  await AppDataSource.manager.delete(Categoria, { restaurante_id: savedRestaurante.id });
  await AppDataSource.manager.delete(ZonaDomicilio, { restaurante_id: savedRestaurante.id });

  const categorias = [];
  for (const nombre of ['Hamburguesas', 'Pizzas', 'Bebidas', 'Postres']) {
    const cat = new Categoria();
    cat.restaurante_id = savedRestaurante.id;
    cat.nombre = nombre;
    cat.descripcion = 'Categoria de ' + nombre;
    cat.orden = categorias.length;
    const savedCat = await AppDataSource.manager.save(cat);
    categorias.push(savedCat);
  }
  console.log('Categorias creadas:', categorias.length);

  const productos = [
    { categoria: categorias[0], nombre: 'Hamburguesa Clasica', precio: 18000, descripcion: 'Pan, carne, queso, lechuga y tomate' },
    { categoria: categorias[0], nombre: 'Hamburguesa Especial', precio: 22000, descripcion: 'Pan, doble carne, queso, bacon, huevo' },
    { categoria: categorias[1], nombre: 'Pizza Margherita', precio: 25000, descripcion: 'Tomate, mozzarella, albahaca' },
    { categoria: categorias[1], nombre: 'Pizza Pepperoni', precio: 28000, descripcion: 'Tomate, mozzarella, pepperoni' },
    { categoria: categorias[2], nombre: 'Coca-Cola', precio: 5000, descripcion: 'Bebida 350ml' },
    { categoria: categorias[2], nombre: 'Jugo Natural', precio: 8000, descripcion: 'Jugo recien hecho' },
    { categoria: categorias[3], nombre: 'Brownie', precio: 12000, descripcion: 'Brownie de chocolate' },
    { categoria: categorias[3], nombre: 'Postre 3 Leches', precio: 15000, descripcion: 'Delicioso postre casero' },
  ];

  for (const prodData of productos) {
    const prod = new Producto();
    prod.restaurante_id = savedRestaurante.id;
    prod.categoria_id = prodData.categoria.id;
    prod.nombre = prodData.nombre;
    prod.precio = prodData.precio;
    prod.descripcion = prodData.descripcion;
    prod.disponible = true;
    await AppDataSource.manager.save(prod);
  }
  console.log('Productos creados:', productos.length);

  const zonas = [
    { nombre: 'Centro', tarifa: 4000 },
    { nombre: 'El Prado', tarifa: 5000 },
    { nombre: 'La Esperanza', tarifa: 6000 },
    { nombre: 'Zona Norte', tarifa: 8000 },
  ];

  for (const zonaData of zonas) {
    const zona = new ZonaDomicilio();
    zona.restaurante_id = savedRestaurante.id;
    zona.nombre = zonaData.nombre;
    zona.tarifa = zonaData.tarifa;
    zona.activa = true;
    await AppDataSource.manager.save(zona);
  }
  console.log('Zonas creadas:', zonas.length);

  // 💡 GESTIÓN ROBUSTA DEL ADMIN MEDIANTE UPSERT (Evita duplicados por email)
  const passwordHash = await bcrypt.hash('admin123', 10);
  await AppDataSource.manager.upsert(
    Administrador,
    [
      {
        email: 'admin@restaurante.com',
        restaurante_id: savedRestaurante.id,
        nombre: 'Admin Demo',
        password_hash: passwordHash,
        activo: true,
      },
    ],
    ['email']
  );
  console.log('Administrador sincronizado: admin@restaurante.com');

  // 💡 CLIENTE GENERAL POR DEFECTO PARA EL CHECKOUT MEDIANTE UPSERT
  const CLIENTE_FIXED_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  await AppDataSource.manager.upsert(
    Cliente,
    [
      {
        id: CLIENTE_FIXED_ID,
        restaurante_id: savedRestaurante.id,
        nombre: 'Cliente General',
        telefono: '3000000000',
      },
    ],
    ['id']
  );
  console.log('Cliente general sincronizado:', CLIENTE_FIXED_ID);

  console.log('\nSeed completado exitosamente!');
  console.log('\nDatos de login:');
  console.log('   Email: admin@restaurante.com');
  console.log('   Contrasena: admin123');

  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('Error en seed:', error);
  process.exit(1);
});