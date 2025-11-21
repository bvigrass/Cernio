import { Controller, Get, Param } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get()
  findAll() {
    return this.marketplaceService.findAllSalvageItems();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marketplaceService.findOneSalvageItem(id);
  }
}
