import { AbstractMongoRepository } from "@drax/crud-back";
import { BankMovementModel } from "../../models/BankMovementModel.js";
class BankMovementMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = BankMovementModel;
        this._searchFields = ['Fecha', 'Concepto', 'NroCpbte', 'Cod', 'bancoOrigen', 'cuilCuitPagador', 'nombrePagador', 'numeroCuentaPagador'];
        this._populateFields = ['pagadorDetectadoId', 'afiliadoId'];
        this._lean = true;
    }
}
export default BankMovementMongoRepository;
export { BankMovementMongoRepository };
