import { Block } from "@shared/lib/block/Block";
import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import { SearchBox } from "@features/search-psychologists";
import { FiltersPanel } from "@widgets/filters-panel";
import { PsychologistCard } from "@widgets/psychologist-card";
import { Spinner } from "@shared/ui/Spinner/Spinner";
import { EmptyState } from "@shared/ui/EmptyState/EmptyState";
import { listPsychologists, type Psychologist, type PsychologistQuery } from "@entities/psychologist";
import { listSpecialties } from "@entities/specialty";
import { routerInstance } from "@shared/lib/router/routerInstance";
import directoryPageTemplate from "@pages/directory/DirectoryPage.hbs?raw";
import "@pages/directory/DirectoryPage.css";

export class DirectoryPage extends Block<BlockOwnProps> {
  protected template = directoryPageTemplate;
  private query: PsychologistQuery = {};

  protected componentDidMount() {
    const searchBox = new SearchBox({
      onSearch: (q) => this.applyQuery({ ...this.query, q }),
    });
    const searchSlot = this.refs.search;
    const searchElement = searchBox.element();

    if (searchSlot && searchElement) 
      searchSlot.replaceWith(searchElement);

    void this.loadFilters();
    void this.loadResults();
  }

  private async loadFilters() {
    const result = await listSpecialties();
    
    if (result.isErr()) 
      return;

    const filtersPanel = new FiltersPanel({
      specialtyOptions: result.value.map((specialty) => ({ value: specialty.id, label: specialty.name })),
      maxRate: 1000,
      onChange: (filters) => this.applyQuery({ ...this.query, ...filters }),
    });

    const filtersSlot = this.refs.filters;  
    const filtersElement = filtersPanel.element();

    if (filtersSlot && filtersElement) 
      filtersSlot.replaceWith(filtersElement);
  }

  private async applyQuery(query: PsychologistQuery) {
    this.query = query;
    await this.loadResults();
  }

  private async loadResults() {
    this.showResults([new Spinner({}).element()]);

    const result = await listPsychologists(this.query);

    if (result.isErr()) {
      this.showResults([
        new EmptyState({
          title: "Ocurrió un error",
          description: "Intentá de nuevo en un momento.",
        }).element(),
      ]);

      return;
    }

    this.renderPsychologists(result.value);
  }

  private renderPsychologists(psychologists: Psychologist[]) {
    if (psychologists.length === 0) {
      this.showResults([
        new EmptyState({
          title: "No se encontraron especialistas",
          description: "Probá con otra palabra o ajustá los filtros.",
        }).element(),
      ]);

      return;
    }

    const cards = psychologists.map((psychologist) =>
      new PsychologistCard({
        psychologist,
        onOpen: (id) => routerInstance.navigate(`/profile/${id}`),
      }).element(),
    );
    
    this.showResults(cards);
  }

  private showResults(elements: Array<Element | null>) {
    this.refs.results?.replaceChildren(...elements.filter((element): element is Element => element !== null));
  }
}
