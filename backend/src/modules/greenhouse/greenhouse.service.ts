import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Greenhouse } from './entities/greenhouse.entity';
import { Zone } from './entities/zone.entity';
import { CreateGreenhouseDto } from './dto';

@Injectable()
export class GreenhouseService {
  constructor(
    @InjectRepository(Greenhouse)
    private readonly greenhouseRepository: Repository<Greenhouse>,
    @InjectRepository(Zone)
    private readonly zoneRepository: Repository<Zone>,
  ) {}

  async createGreenhouse(
    userId: string,
    dto: CreateGreenhouseDto,
  ): Promise<Greenhouse> {
    // Create greenhouse entity
    const greenhouse = this.greenhouseRepository.create({
      userId,
      name: dto.name,
      location: dto.location,
      description: dto.description,
    });

    // Save greenhouse first to get the ID
    const savedGreenhouse = await this.greenhouseRepository.save(greenhouse);

    // Create zones with order preservation
    if (dto.zones && dto.zones.length > 0) {
      const zones = dto.zones.map((zoneDto, index) =>
        this.zoneRepository.create({
          greenhouseId: savedGreenhouse.id,
          name: zoneDto.name,
          description: zoneDto.description,
          orderIndex: index,
        }),
      );

      await this.zoneRepository.save(zones);
      savedGreenhouse.zones = zones;
    }

    return savedGreenhouse;
  }

  async getGreenhouseByUserId(userId: string): Promise<Greenhouse | null> {
    const greenhouse = await this.greenhouseRepository.findOne({
      where: { userId },
      relations: ['zones'],
    });

    return greenhouse;
  }

  async getGreenhouseById(id: string): Promise<Greenhouse> {
    const greenhouse = await this.greenhouseRepository.findOne({
      where: { id },
      relations: ['zones'],
    });

    if (!greenhouse) {
      throw new NotFoundException(`Greenhouse with ID ${id} not found`);
    }

    return greenhouse;
  }
}
