import { PartialType } from '@nestjs/swagger';
import { CreateChurchDto } from './create-church.dto';
import { IUpdateChurchDto } from '@ekklesia/shared';

export class UpdateChurchDto extends PartialType(CreateChurchDto) implements IUpdateChurchDto {}
