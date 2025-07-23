import { PartialType } from '@nestjs/swagger';
import { CreateMemberDto } from './create-member.dto';
import { IUpdateMemberDto } from '@ekklesia/shared';

export class UpdateMemberDto extends PartialType(CreateMemberDto) implements IUpdateMemberDto {}
