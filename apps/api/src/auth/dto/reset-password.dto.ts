import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token สำหรับรีเซ็ตรหัสผ่าน' })
  @IsNotEmpty({ message: 'ไม่พบ Token สำหรับรีเซ็ตรหัสผ่าน' })
  token: string;

  @ApiProperty({ example: 'newpassword123', description: 'รหัสผ่านใหม่' })
  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่านใหม่' })
  @MinLength(6, { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' })
  newPassword: string;
}
