import { createConnection } from "typeorm";
import * as request from 'supertest';
import app from "../../src/app";
import { port } from "../../src/config";

let connection, server;
let createdUserId;

const testUser = {
  firstName: 'John',
  lastName: 'Doe',
  age: 20,
};

beforeAll(async () => {
  connection = await createConnection();
  await connection.synchronize(true);
  server = app.listen(port);
});

afterAll(() => {
  connection.close();
  server.close();
});

it('should return no users initially', async () => {
  const response = await request(app).get('/users');
  expect(response.statusCode).toBe(200);
  expect(response.body).toEqual([]);
});

it('should create a user', async () => {
  const response = await request(app).post('/users').send(testUser);
  expect(response.statusCode).toBe(200);
  expect(response.body).toEqual({ ...testUser,id:1});
  createdUserId = response.body.id; // Store the created user ID
});

it('should not create a user if no firstName is given', async () => {
  const response = await request(app).post('/users').send({ lastName: 'Doe', age: 21 });
  expect(response.statusCode).toBe(400);
  expect(response.body.errors).not.toBeNull();
  expect(response.body.errors.length).toBe(1);
  expect(response.body.errors[0]).toEqual({
    msg: 'Invalid value', param: 'firstName', location: 'body'
  });
});

it('should not create a user if age is less than 0', async () => {
  const response = await request(app).post('/users').send({ firstName: 'John', lastName: 'Doe', age: -1 });
  expect(response.statusCode).toBe(400);
  expect(response.body.errors).not.toBeNull();
  expect(response.body.errors.length).toBe(1);
  expect(response.body.errors[0]).toEqual({
    msg: 'age must be a positive integer', param: 'age', value: -1, location: 'body',
  });
});

it('should retrieve the created user', async () => {
  expect(createdUserId).toBe(1);
  expect(createdUserId).toBeDefined(); // Ensure createdUserId is defined
  const response = await request(app).get(`/users/${createdUserId}`);
  expect(response.statusCode).toBe(200);
  expect(response.body).toEqual(expect.objectContaining({ ...testUser, id: createdUserId }));
});

it('should update the created user', async () => {
  expect(createdUserId).toBeDefined(); // Ensure createdUserId is defined
  const updatedUser = {
    firstName: 'Jane',
    lastName: 'Smith',
    age: 25,
  };

  const response = await request(app).put(`/users/${createdUserId}`).send(updatedUser);
  expect(response.statusCode).toBe(200);
  expect(response.body).toEqual({ ...updatedUser, id: createdUserId });
});

it('should delete the created user', async () => {
  expect(createdUserId).toBeDefined(); // Ensure createdUserId is defined
  const response = await request(app).delete(`/users/${createdUserId}`);
  expect(response.statusCode).toBe(200);
  expect(response.body.message).toBe('User deleted successfully');
});
