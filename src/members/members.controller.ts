import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { MemberEntity } from './entities/member.entity';
import { ListMembersQueryDto } from './dto/list-members-query.dto';
import { PaginatedMembersDto } from './dto/paginated-members.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Controller('members')
export class MembersController {
  constructor(private readonly memberService: MembersService) {}

  @Post()
  create(@Body() dto: CreateMemberDto): Promise<MemberEntity> {
    return this.memberService.create(dto);
  }

  @Get()
  findAll(@Query() query: ListMembersQueryDto): Promise<PaginatedMembersDto> {
    return this.memberService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<MemberEntity> {
    return this.memberService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMemberDto,
  ): Promise<MemberEntity> {
    return this.memberService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.memberService.remove(id);
  }
}
