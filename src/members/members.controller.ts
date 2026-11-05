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
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateMemberDto } from './dto/create-member.dto';
import { ListMembersQueryDto } from './dto/list-members-query.dto';
import { PaginatedMembersDto } from './dto/paginated-members.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberEntity } from './entities/member.entity';
import { MembersService } from './members.service';

@ApiTags('members')
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a member' })
  @ApiCreatedResponse({ type: MemberEntity })
  @ApiBadRequestResponse({ description: 'Invalid payload.' })
  @ApiConflictResponse({
    description: 'A member with this email already exists.',
  })
  create(@Body() dto: CreateMemberDto): Promise<MemberEntity> {
    return this.membersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List members (paginated)' })
  @ApiOkResponse({ type: PaginatedMembersDto })
  @ApiBadRequestResponse({ description: 'Invalid pagination parameters.' })
  findAll(@Query() query: ListMembersQueryDto): Promise<PaginatedMembersDto> {
    return this.membersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a member by id' })
  @ApiOkResponse({ type: MemberEntity })
  @ApiBadRequestResponse({ description: 'Invalid id (UUID expected).' })
  @ApiNotFoundResponse({ description: 'Member not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<MemberEntity> {
    return this.membersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a member (partial)' })
  @ApiOkResponse({ type: MemberEntity })
  @ApiBadRequestResponse({ description: 'Invalid id or payload.' })
  @ApiNotFoundResponse({ description: 'Member not found.' })
  @ApiConflictResponse({
    description: 'A member with this email already exists.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMemberDto,
  ): Promise<MemberEntity> {
    return this.membersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a member' })
  @ApiNoContentResponse({ description: 'Member deleted.' })
  @ApiBadRequestResponse({ description: 'Invalid id (UUID expected).' })
  @ApiNotFoundResponse({ description: 'Member not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.membersService.remove(id);
  }
}
