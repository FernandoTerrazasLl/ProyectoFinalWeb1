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
    this.mountInto("search", new SearchBox({
      onSearch: (q) => this.applyQuery({ ...this.query, q }),
    }));

    void this.loadFilters();
    void this.loadResults();
  }

  private async loadFilters() {
    const result = await listSpecialties();

    if (result.isErr())
      return;

    this.mountInto("filters", new FiltersPanel({
      specialtyOptions: result.value.map((specialty) => ({ value: specialty.id, label: specialty.name })),
      maxRate: 1000,
      onChange: (filters) => this.applyQuery({ ...this.query, ...filters }),
    }));
  }

  private async applyQuery(query: PsychologistQuery) {
    this.query = query;
    await this.loadResults();
  }

  private async loadResults() {
    this.replaceChildrenInto("results", [new Spinner({})]);

    const result = await listPsychologists(this.query);

    if (result.isErr()) {
      this.replaceChildrenInto("results", [
        new EmptyState({ title: "Ocurrió un error", description: "Intentá de nuevo en un momento." }),
      ]);
      return;
    }

    this.renderPsychologists(result.value);
  }

  private renderPsychologists(psychologists: Psychologist[]) {
    if (psychologists.length === 0) {
      this.replaceChildrenInto("results", [
        new EmptyState({ title: "No se encontraron especialistas", description: "Probá con otra palabra o ajustá los filtros." }),
      ]);
      return;
    }

    this.replaceChildrenInto(
      "results",
      psychologists.map((psychologist) =>
        new PsychologistCard({ psychologist, onOpen: (id) => routerInstance.navigate(`/profile/${id}`) }),
      ),
    );
  }
}
