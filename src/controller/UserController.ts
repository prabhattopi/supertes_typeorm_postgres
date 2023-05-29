import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {User} from "../entity/User";

export class UserController {

  private userRepository = getRepository(User);

  async all(request: Request, response: Response, next: NextFunction) {
    return this.userRepository.find();
  }

  async one(request: Request, response: Response, next: NextFunction) {
    return this.userRepository.findOne(Number(request.params.id));
  }

  async save(request: Request, response: Response, next: NextFunction) {
    return this.userRepository.save(request.body);
  }
  async update(request: Request, response: Response, next: NextFunction) {
    const userToUpdate = await this.userRepository.findOne(request.params.id);
    if (!userToUpdate) throw new Error('User not found');

    this.userRepository.merge(userToUpdate, request.body);
    return this.userRepository.save(userToUpdate);
  }
  async remove(request: Request, response: Response, next: NextFunction) {
    let userToRemove = await this.userRepository.findOne(request.params.id);
    if (!userToRemove) throw new Error('User not found');
    await this.userRepository.remove(userToRemove);
  }
}
